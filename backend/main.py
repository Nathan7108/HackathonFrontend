# Sentinel AI — FastAPI backend (S3-01)
# All ML endpoints + GPT-4o intelligence briefs. See GitHub Issue #21.
# Architecture: pre-compute all country scores at startup; dashboard/countries/anomalies read from cache; only GPT-4o briefs on-demand.

import asyncio
import json
import os
import time
import urllib.parse
from datetime import datetime
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parents[1]
_env_path = ROOT / ".env"
load_dotenv(_env_path, override=True)  # override so we always use project root .env

from backend.ml.pipeline import (
    FEATURE_COLUMNS,
    MONITORED_COUNTRIES,
    SentinelFeaturePipeline,
)
from backend.ml.risk_scorer import predict_risk, level_from_score
from backend.ml.anomaly import detect_anomaly
from backend.ml.sentiment import load_finbert, analyze_headlines_sentiment
from backend.ml.forecaster import forecast_risk, SEQUENCE_FEATURES
from backend.ml.tracker import PredictionTracker

MODEL_VERSION = "2.0.0"

# --- Pydantic models ---
class AnalyzeRequest(BaseModel):
    country: str
    countryCode: str


class RiskScoreRequest(BaseModel):
    country: str
    countryCode: str


class ForecastRequest(BaseModel):
    country: str
    countryCode: str


# --- Pre-computed caches (filled at startup, refreshed every 15 min) ---
_country_scores: dict = {}  # code -> {riskScore, riskLevel, isAnomaly, anomalyScore, severity, features, computedAt, name, risk_prediction, anomaly}
_dashboard_summary: dict = {}  # full dashboard summary JSON
_previous_summary: dict = {}  # for delta computation (globalThreatIndex, highPlusCountries)
_previous_scores: dict = {}   # code -> {"riskScore": int, "riskLevel": str}; for KPI deltas
_previous_sub_scores: dict = {}  # sub-score key -> value; for delta

# Real KPI history: one snapshot per precompute run. No mock data.
KPI_HISTORY_MAX = 30
_kpi_history: list[dict] = []

RISK_TIER_ORDER = {"LOW": 0, "MODERATE": 1, "ELEVATED": 2, "HIGH": 3, "CRITICAL": 4}

# Legacy cache for /api/analyze brief responses (optional; analyze now uses _country_scores + GPT-4o on-demand)
_cache: dict = {}
_cache_ttl: dict = {}
CACHE_TTL_SECONDS = 900


def is_cache_valid(country_code: str) -> bool:
    if country_code not in _cache_ttl:
        return False
    return (datetime.utcnow() - _cache_ttl[country_code]).total_seconds() < CACHE_TTL_SECONDS


# --- Data loading ---
def load_gdelt_cache(country_code: str) -> pd.DataFrame:
    path = ROOT / "data" / "gdelt" / f"{country_code}_events.csv"
    return pd.read_csv(path) if path.exists() else pd.DataFrame()


def load_acled_cache(country: str) -> pd.DataFrame:
    safe = country.lower().replace(" ", "_")
    path = ROOT / "data" / "acled" / f"{safe}.csv"
    return pd.read_csv(path) if path.exists() else pd.DataFrame()


def load_ucdp_cache(country: str) -> pd.DataFrame:
    safe = country.lower().replace(" ", "_")
    path = ROOT / "data" / "ucdp" / f"{safe}_ged.csv"
    if not path.exists():
        ucdp_dir = ROOT / "data" / "ucdp"
        if ucdp_dir.exists():
            alts = list(ucdp_dir.glob(f"*{safe}*ged*.csv"))
            path = alts[0] if alts else None
    return pd.read_csv(path) if path and path.exists() else pd.DataFrame()


def load_wb_cache(country_code: str) -> dict:
    info = MONITORED_COUNTRIES.get(country_code.upper(), {})
    iso3 = info.get("iso3", country_code)
    path = ROOT / "data" / "world_bank" / f"{iso3}.json"
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f).get("features", {})
    return {}


# --- Headlines (GDELT DOC 2.0 primary, NewsAPI fallback) ---
async def fetch_headlines(country: str, max_headlines: int = 10) -> list[str]:
    """Fetch headlines for a country. Primary: GDELT DOC 2.0 API (no key). Fallback: NewsAPI if key set."""
    import httpx

    # 1) Try GDELT DOC 2.0 API first (no API key required)
    def _parse_gdelt_articles(data: dict) -> list[str]:
        articles = data.get("articles") or []
        out = []
        for a in articles:
            title = (a.get("title") or "").strip()
            if title and title.lower() != "[removed]":
                out.append(title)
        return out

    for timespan in ("24h", "7d"):
        try:
            url = (
                "https://api.gdeltproject.org/api/v2/doc/doc"
                f"?query={urllib.parse.quote(country)}&mode=artlist&maxrecords=15&format=json&timespan={timespan}"
            )
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, timeout=12)
                resp.raise_for_status()
                data = resp.json()
            out = _parse_gdelt_articles(data)
            if out:
                return out[:max_headlines]
        except Exception:
            continue  # Try next timespan or fall back to NewsAPI

    # 2) Fallback to NewsAPI if key is set
    api_key = _get_news_api_key()
    if not api_key:
        return []
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://newsapi.org/v2/top-headlines",
                params={
                    "q": country,
                    "language": "en",
                    "pageSize": max_headlines,
                    "apiKey": api_key,
                },
                timeout=10,
            )
            data = resp.json()
            articles = data.get("articles") or []
        out = []
        for a in articles:
            title = (a.get("title") or "").strip()
            if title and title.lower() != "[removed]":
                out.append(title)
        return out
    except Exception:
        return []


def _relative_time(published_at: str) -> str:
    """Format ISO publishedAt as relative time e.g. '2m', '1h', '3h'."""
    try:
        from datetime import timezone
        pub = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        delta_sec = max(0, int((now - pub).total_seconds()))
        if delta_sec < 60:
            return "now"
        if delta_sec < 3600:
            return f"{delta_sec // 60}m"
        if delta_sec < 86400:
            return f"{delta_sec // 3600}h"
        return f"{delta_sec // 86400}d"
    except Exception:
        return "—"


def _infer_type_from_title(title: str) -> str:
    """Infer activity type from headline for display tag."""
    t = (title or "").upper()
    if any(x in t for x in ("MILITARY", "STRIKE", "DRONE", "MISSILE", "ARMY", "NAVAL", "WAR")):
        return "MILITARY"
    if any(x in t for x in ("BATTLE", "CLASH", "ATTACK", "FIGHT", "CONFLICT")):
        return "BATTLE"
    if any(x in t for x in ("PROTEST", "RALLY", "DEMONSTRATION")):
        return "PROTEST"
    if any(x in t for x in ("SANCTION", "DIPLOMACY", "TALKS", "TREATY", "CEASEFIRE")):
        return "DIPLOMATIC"
    if any(x in t for x in ("ECONOMY", "INFLATION", "MARKET", "TRADE")):
        return "ECONOMIC"
    if any(x in t for x in ("HUMANITARIAN", "AID", "REFUGEE")):
        return "HUMANITARIAN"
    return "NEWS"


def _get_news_api_key() -> str:
    """Read NewsAPI key from env or project root .env. Supports NEWS_API, NEW_API, NEWSAPI_KEY, NEWS_API_KEY."""
    for name in ("NEWS_API", "NEW_API", "NEWSAPI_KEY", "NEWS_API_KEY"):
        key = os.getenv(name)
        if key:
            return key.strip()
    env_file = ROOT / ".env"
    if env_file.exists():
        with open(env_file, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                for prefix in ("NEWS_API=", "NEW_API=", "NEWSAPI_KEY=", "NEWS_API_KEY="):
                    if line.startswith(prefix):
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""


async def fetch_recent_activity(limit: int = 20) -> tuple[list[dict], str | None]:
    """Fetch recent-activity feed from NewsAPI. Uses top-headlines (free tier returns data)."""
    import logging
    log = logging.getLogger("backend.newsapi")
    api_key = _get_news_api_key()
    if not api_key:
        return [], "noApiKey"
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://newsapi.org/v2/top-headlines",
                params={
                    "country": "us",
                    "pageSize": min(limit, 100),
                    "apiKey": api_key,
                },
                timeout=12,
            )
            data = resp.json()
            articles = data.get("articles") or []
            if resp.status_code != 200:
                code = (data.get("code") or "").lower()
                msg = data.get("message", resp.text)
                log.warning("NewsAPI error status=%s code=%s message=%s", resp.status_code, code, msg)
                if resp.status_code == 401 or "apikey" in code or "invalid" in code:
                    return [], "apiKeyInvalid"
                return [], "fetchFailed"
            out = []
            for a in articles:
                title = (a.get("title") or "").strip()
                if not title or title.lower() == "[removed]":
                    continue
                published_at = a.get("publishedAt") or ""
                out.append({
                    "time": _relative_time(published_at),
                    "icon": "🟡",
                    "text": title,
                    "country": "—",
                    "type": _infer_type_from_title(title),
                })
            return out[:limit], None
    except Exception as e:
        log.exception("NewsAPI fetch failed: %s", e)
        return [], "fetchFailed"


# --- GPT-4o ---
def build_gpt4o_context(country: str, risk_prediction: dict, anomaly: dict, finbert_results: dict, headlines: list, features: dict) -> str:
    return f"""
ML RISK ASSESSMENT FOR {country.upper()}:
- ML Risk Level: {risk_prediction.get('risk_level', 'N/A')} (Score: {risk_prediction.get('risk_score', 0)}/100)
- Model Confidence: {risk_prediction.get('confidence', 0):.0%}
- Anomaly Alert: {anomaly.get('is_anomaly', False)} (Severity: {anomaly.get('severity', 'LOW')})
- Headline Sentiment: {finbert_results.get('dominant_sentiment', 'neutral')} ({finbert_results.get('headline_escalatory_pct', 0):.0%} escalatory)
- Top ML Risk Drivers: {', '.join((risk_prediction.get('top_drivers') or [])[:3])}
- Data Sources: GDELT + ACLED + UCDP + World Bank + NewsAPI.ai

TODAY'S HEADLINES:
{chr(10).join(f'- {h}' for h in (headlines or [])[:5])}

TASK: Write an analyst-grade intelligence brief explaining WHY the ML model scored
{country} at {risk_prediction.get('risk_score', 0)}/100. Reference specific named actors, regions,
and mechanisms from the headlines. Do NOT invent the score — explain it.

Return valid JSON with these fields:
- riskScore (int 0-100, use {risk_prediction.get('risk_score', 0)})
- riskLevel (string, use "{risk_prediction.get('risk_level', 'MODERATE')}")
- summary (string, 2-3 sentence executive summary)
- keyFactors (array of 3-5 strings, each a specific risk driver)
- industries (array of affected industry strings)
- watchList (array of 3-5 things to monitor)
- causalChain (array of 7 strings showing step-by-step escalation chain from today's signals to predicted crisis)
- lastUpdated (ISO timestamp)

Return ONLY valid JSON. No markdown, no backticks, no explanation outside the JSON.
"""


async def call_gpt4o(ml_context: str, country: str, risk_prediction: dict) -> dict | None:
    if not os.getenv("OPENAI_API_KEY"):
        return None
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI()
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a geopolitical intelligence analyst. Return only valid JSON."},
                {"role": "user", "content": ml_context},
            ],
            temperature=0.3,
            max_tokens=1500,
        )
        text = response.choices[0].message.content.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(text)
    except Exception:
        return None


def _anomaly_input_from_features(features: dict) -> dict:
    """Map pipeline feature names to ANOMALY_FEATURES keys."""
    return {
        "goldstein_mean": features.get("gdelt_goldstein_mean", 0),
        "goldstein_std": features.get("gdelt_goldstein_std", 0),
        "goldstein_min": features.get("gdelt_goldstein_min", 0),
        "mentions_total": features.get("gdelt_event_count", 0),
        "avg_tone": features.get("gdelt_avg_tone", 0),
        "event_count": features.get("gdelt_event_count", 0),
    }


def _build_forecast_sequence(features: dict) -> "np.ndarray":
    """Build (90, 12) array from pipeline features for LSTM (repeat current row 90 times)."""
    import numpy as np
    risk = min(100.0, max(0.0, float(features.get("political_risk_score", features.get("conflict_composite", 0)))))
    row = [
        risk,
        float(features.get("gdelt_goldstein_mean", 0)),
        float(features.get("gdelt_event_count", 0)),
        float(features.get("acled_fatalities_30d", 0)),
        float(features.get("acled_battle_count", 0)),
        float(features.get("finbert_negative_score", 0)),
        float(features.get("wb_gdp_growth_latest", 0)),
        float(features.get("anomaly_score", 0)),
        float(features.get("gdelt_avg_tone", 0)),
        float(features.get("gdelt_event_acceleration", 0)),
        float(features.get("ucdp_conflict_intensity", 0)),
        float(features.get("econ_composite_score", 0)),
    ]
    return np.array([row] * 90, dtype=np.float32)


def _get_anomaly_trigger(country_code: str, features: dict) -> str:
    """Pick the anomaly feature with the highest z-score deviation from the scaler mean."""
    from backend.ml.anomaly import ANOMALY_FEATURES
    scaler_path = ROOT / "models" / f"scaler_{country_code}.pkl"
    try:
        import joblib as _jl
        scaler = _jl.load(scaler_path)
        anomaly_input = _anomaly_input_from_features(features)
        vals = [anomaly_input.get(f, 0) for f in ANOMALY_FEATURES]
        deviations = [
            (abs(v - m) / s if s > 0 else 0, name)
            for v, m, s, name in zip(vals, scaler.mean_, scaler.scale_, ANOMALY_FEATURES)
        ]
        deviations.sort(key=lambda x: x[0], reverse=True)
        return deviations[0][1] if deviations else "event_pattern_deviation"
    except Exception:
        return "event_pattern_deviation"


def _get_source_last_update(source_dir: Path, pattern: str) -> str | None:
    """Most recent mtime of files matching *pattern* inside *source_dir*, as ISO-8601."""
    try:
        files = [f for f in source_dir.glob(pattern) if f.is_file() and f.name != ".gitkeep"]
        if not files:
            return None
        newest = max(files, key=lambda f: f.stat().st_mtime)
        return datetime.utcfromtimestamp(newest.stat().st_mtime).isoformat() + "Z"
    except Exception:
        return None


def _country_sub_scores(features: dict) -> dict:
    """Per-country 5 sub-scores from pipeline features for /api/analyze. Normalized scales."""
    conflict = float(features.get("conflict_composite", 0) or 0)
    protest = float(features.get("acled_protest_count", 0) or 0)
    econ = float(features.get("econ_composite_score", 0) or 0)
    humanitarian = float(features.get("humanitarian_score", 0) or 0)
    neg_idx = float(features.get("media_negativity_index", 0) or 0)
    escal_pct = float(features.get("headline_escalatory_pct", 0) or 0)
    return {
        "conflictIntensity": round(min(100, conflict), 1),
        "socialUnrest": round(min(100, (protest / 50) * 100), 1),
        "economicStress": round(min(100, econ), 1),
        "humanitarian": round(min(100, humanitarian), 1),
        "mediaSentiment": round(min(100, neg_idx * 100 + escal_pct * 100), 1),
    }


def _compute_sub_scores() -> dict:
    """Aggregate 5 sub-scores from cached country features. All from real pipeline data."""
    if not _country_scores:
        return {}
    values: list[float] = []
    # 1. Conflict Intensity (0-100): conflict_composite
    values = [c["features"].get("conflict_composite", 0) or 0 for c in _country_scores.values()]
    conflict_intensity = round(sum(values) / len(values)) if values else 0
    conflict_intensity = max(0, min(100, conflict_intensity))

    # 2. Social Unrest (0-100): protests, civilian violence, volatility
    def _social(f: dict) -> float:
        p = float(f.get("acled_protest_count") or 0)
        v = float(f.get("acled_civilian_violence") or 0)
        g = abs(float(f.get("gdelt_volatility") or 0))
        return min(100.0, p * 1.2 + v * 2.0 + g * 15.0)
    values = [_social(c["features"]) for c in _country_scores.values()]
    social_unrest = round(sum(values) / len(values)) if values else 0
    social_unrest = max(0, min(100, social_unrest))

    # 3. Economic Stress (0-100): invert econ_composite so higher growth = lower stress
    values = [float(c["features"].get("economic_stress_score") or c["features"].get("econ_composite_score") or 0) for c in _country_scores.values()]
    mean_econ = sum(values) / len(values) if values else 0
    economic_stress = round(min(100, max(0, 50 - mean_econ * 0.4)))  # scale so typical range maps to 0-100

    # 4. Humanitarian (0-100): humanitarian_score
    values = [float(c["features"].get("humanitarian_score") or 0) for c in _country_scores.values()]
    humanitarian = round(sum(values) / len(values)) if values else 0
    humanitarian = max(0, min(100, humanitarian))

    # 5. Media & Sentiment (0-100): FinBERT + escalatory % + negativity index
    def _media(f: dict) -> float:
        a = float(f.get("finbert_negative_score") or 0) * 100.0
        b = float(f.get("headline_escalatory_pct") or 0) * 100.0
        c = float(f.get("media_negativity_index") or 0) * 100.0
        return min(100.0, (a + b + c) / 3.0)
    values = [_media(c["features"]) for c in _country_scores.values()]
    media_sentiment = round(sum(values) / len(values)) if values else 0
    media_sentiment = max(0, min(100, media_sentiment))

    return {
        "conflictIntensity": conflict_intensity,
        "socialUnrest": social_unrest,
        "economicStress": economic_stress,
        "humanitarian": humanitarian,
        "mediaSentiment": media_sentiment,
    }


def _build_escalation_alerts(now: str) -> list[dict]:
    """Build list of escalation alerts from cached scores vs previous. Each alert has type, country, code, detail, time, severity."""
    alerts: list[dict] = []
    for code, c in _country_scores.items():
        prev = _previous_scores.get(code, {})
        prev_level = prev.get("riskLevel")
        prev_score = prev.get("riskScore")

        if prev_level and RISK_TIER_ORDER.get(c["riskLevel"], 0) > RISK_TIER_ORDER.get(prev_level, 0):
            alerts.append({
                "type": "TIER_CHANGE",
                "country": c["name"],
                "code": code,
                "detail": f"{prev_level} \u2192 {c['riskLevel']}",
                "time": now,
                "severity": "HIGH",
            })

        if prev_score is not None and (c["riskScore"] - prev_score) > 10:
            alerts.append({
                "type": "SCORE_SPIKE",
                "country": c["name"],
                "code": code,
                "detail": f"Score +{c['riskScore'] - prev_score} ({prev_score} \u2192 {c['riskScore']})",
                "time": now,
                "severity": "HIGH",
            })

        if c["isAnomaly"]:
            trigger = _get_anomaly_trigger(code, c["features"])
            sev = c.get("severity") or "MED"
            severity = "HIGH" if sev == "HIGH" else ("ELEVATED" if sev == "MED" else "LOW")
            alerts.append({
                "type": "ANOMALY_DETECTED",
                "country": c["name"],
                "code": code,
                "detail": f"Anomaly: {trigger} (score {c['anomalyScore']:.2f})",
                "time": now,
                "severity": severity,
            })
    return alerts


def _build_sources_active() -> list[dict]:
    """Static source metadata with live lastUpdate timestamps from data files."""
    return [
        {"name": "GDELT",      "status": "LIVE",   "lastUpdate": _get_source_last_update(ROOT / "data" / "gdelt", "*.csv"),  "frequency": "15min",       "records": "200+ countries"},
        {"name": "ACLED",      "status": "LIVE",   "lastUpdate": _get_source_last_update(ROOT / "data" / "acled", "*.csv"),  "frequency": "weekly",      "records": "220 countries"},
        {"name": "UCDP",       "status": "LIVE",   "lastUpdate": _get_source_last_update(ROOT / "data" / "ucdp", "*.csv"),   "frequency": "annual",      "records": "124 countries"},
        {"name": "World Bank", "status": "LIVE",   "lastUpdate": _get_source_last_update(ROOT / "data" / "world_bank", "*.json"), "frequency": "quarterly", "records": "266 economies"},
        {"name": "NewsAPI",    "status": "LIVE",   "lastUpdate": None,                                                        "frequency": "per-request", "records": "live headlines"},
        {"name": "FinBERT",    "status": "LOADED", "lastUpdate": None,                                                        "frequency": "per-request", "records": "110M params"},
    ]


# Only precompute this many countries so startup finishes in seconds, not minutes.
DASHBOARD_COUNTRY_LIMIT = 15

async def precompute_all_scores() -> None:
    """Pre-compute ML scores for a limited set of countries; fill _country_scores and _dashboard_summary."""
    global _country_scores, _dashboard_summary, _previous_summary
    t0 = time.perf_counter()
    _country_scores.clear()
    all_features = SentinelFeaturePipeline.compute_all_countries(limit=DASHBOARD_COUNTRY_LIMIT)
    # Iterate only over countries we actually computed
    items = list(MONITORED_COUNTRIES.items())[:DASHBOARD_COUNTRY_LIMIT]
    country_rows = []

    for code, info in items:
        features = all_features.get(code, {})
        try:
            pred = predict_risk(features)
            risk_score = pred["risk_score"]
            risk_level = pred["risk_level"]
        except FileNotFoundError:
            risk_score = 0
            risk_level = "LOW"
            pred = {
                "risk_level": risk_level,
                "risk_score": risk_score,
                "confidence": 0.5,
                "probabilities": {},
                "top_drivers": [],
            }

        anomaly_input = _anomaly_input_from_features(features)
        anomaly = detect_anomaly(code, anomaly_input)
        features["anomaly_score"] = anomaly["anomaly_score"]

        if anomaly["is_anomaly"]:
            risk_score = min(100, risk_score + int(anomaly["anomaly_score"] * 15))
            risk_level = level_from_score(risk_score)
            pred = dict(pred, risk_score=risk_score, risk_level=risk_level)

        computed_at = datetime.utcnow().isoformat() + "Z"
        _country_scores[code] = {
            "riskScore": risk_score,
            "riskLevel": risk_level,
            "isAnomaly": anomaly["is_anomaly"],
            "anomalyScore": anomaly["anomaly_score"],
            "severity": anomaly["severity"],
            "features": features,
            "computedAt": computed_at,
            "name": info["name"],
            "risk_prediction": pred,
            "anomaly": anomaly,
        }
        country_rows.append({
            "code": code,
            "name": info["name"],
            "riskScore": risk_score,
            "riskLevel": risk_level,
            "isAnomaly": anomaly["is_anomaly"],
            "anomalyScore": anomaly["anomaly_score"],
        })

    risk_scores = [r["riskScore"] for r in country_rows]
    global_threat_index = round(sum(risk_scores) / len(risk_scores)) if risk_scores else 0
    prev_gti = _previous_summary.get("globalThreatIndex", global_threat_index)
    global_threat_index_delta = global_threat_index - prev_gti

    active_anomalies = sum(1 for r in country_rows if r["isAnomaly"])
    high_plus_countries = sum(1 for r in country_rows if r["riskLevel"] in ("HIGH", "CRITICAL"))
    prev_high = _previous_summary.get("highPlusCountries", high_plus_countries)
    high_plus_delta = high_plus_countries - prev_high

    escalation_alerts_24h = sum(1 for r in country_rows if r["anomalyScore"] > 0.5)
    accuracy_result = tracker.compute_accuracy(days_back=90)
    model_health = round(accuracy_result["accuracy_pct"], 1)

    countries_sorted = sorted(country_rows, key=lambda r: r["riskScore"], reverse=True)
    computed_at = datetime.utcnow().isoformat() + "Z"

    _dashboard_summary = {
        "globalThreatIndex": global_threat_index,
        "globalThreatIndexDelta": global_threat_index_delta,
        "activeAnomalies": active_anomalies,
        "highPlusCountries": high_plus_countries,
        "highPlusCountriesDelta": high_plus_delta,
        "escalationAlerts24h": escalation_alerts_24h,
        "modelHealth": model_health,
        "countries": countries_sorted,
        "computedAt": computed_at,
    }
    _previous_summary["globalThreatIndex"] = global_threat_index
    _previous_summary["highPlusCountries"] = high_plus_countries

    # Append real KPI snapshot to history (no mock; grows each refresh, max KPI_HISTORY_MAX)
    sources = _build_sources_active()
    sources_active = sum(1 for s in sources if s["status"] in ("LIVE", "LOADED"))
    _kpi_history.append({
        "globalThreatIndex": global_threat_index,
        "activeAnomalies": active_anomalies,
        "highPlusCountries": high_plus_countries,
        "escalationAlerts": escalation_alerts_24h,
        "modelAccuracy": model_health,
        "sourcesActive": sources_active,
    })
    while len(_kpi_history) > KPI_HISTORY_MAX:
        _kpi_history.pop(0)

    elapsed = time.perf_counter() - t0
    n = len(country_rows)
    print(f"Pre-computed {n} countries in {elapsed:.1f}s")


async def refresh_loop() -> None:
    """Background: refresh pre-computed scores every 15 minutes."""
    while True:
        await asyncio.sleep(900)
        await precompute_all_scores()
        print(f"Scores refreshed at {datetime.utcnow().isoformat()}Z")


# --- App ---
app = FastAPI(title="Sentinel AI API", version=MODEL_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tracker = PredictionTracker()


@app.on_event("startup")
async def startup():
    # FinBERT loaded on first /api/analyze or /api/risk-score call so dashboard comes up fast
    await precompute_all_scores()
    asyncio.create_task(refresh_loop())
    print("Sentinel AI backend ready — all scores cached")


@app.get("/")
async def root():
    """Simple root so the backend URL loads in a browser."""
    from fastapi.responses import HTMLResponse
    return HTMLResponse(
        "<!DOCTYPE html><html><body style='font-family:sans-serif;padding:2rem'>"
        "<h1>Sentinel AI API</h1><p>Backend is running.</p>"
        "<ul><li><a href='/health'>/health</a></li>"
        "<li><a href='/docs'>/docs</a> (Swagger)</li>"
        "<li><a href='/api/dashboard/summary'>/api/dashboard/summary</a></li>"
        "<li><a href='/api/dashboard/kpis'>/api/dashboard/kpis</a></li>"
        "<li><a href='/api/dashboard/sub-scores'>/api/dashboard/sub-scores</a></li></ul>"
        "</body></html>"
    )


@app.get("/health")
async def health():
    """Check API is up and ML model files are present."""
    risk_model = ROOT / "models" / "risk_scorer.pkl"
    encoder = ROOT / "models" / "risk_label_encoder.pkl"
    ml_ready = risk_model.exists() and encoder.exists()
    return {
        "status": "ok",
        "api": True,
        "ml": ml_ready,
        "version": MODEL_VERSION,
    }


def _validate_country(code: str) -> None:
    if code.upper() not in MONITORED_COUNTRIES:
        raise HTTPException(status_code=400, detail=f"Country code {code} not in monitored list")


@app.post("/api/analyze")
async def analyze_country(request: AnalyzeRequest):
    """Cached ML score from precompute + on-demand GPT-4o brief. Headlines fetched live for context."""
    country = request.country
    country_code = request.countryCode.strip().upper()
    _validate_country(country_code)

    if not _country_scores or country_code not in _country_scores:
        raise HTTPException(status_code=503, detail="Scores not yet computed; wait for backend startup to finish.")

    c = _country_scores[country_code]
    if is_cache_valid(country_code):
        cached = _cache[country_code].copy()
        cached["subScores"] = _country_sub_scores(c["features"])
        return cached

    risk_prediction = c["risk_prediction"]
    anomaly = c["anomaly"]
    features = c["features"]

    headlines = await fetch_headlines(country)
    finbert_results = analyze_headlines_sentiment(headlines)

    tracker.log_prediction(country_code, risk_prediction, features, MODEL_VERSION)

    ml_context = build_gpt4o_context(country, risk_prediction, anomaly, finbert_results, headlines, features)
    brief = await call_gpt4o(ml_context, country, risk_prediction)

    if brief is None:
        brief = {
            "riskScore": risk_prediction["risk_score"],
            "riskLevel": risk_prediction["risk_level"],
            "summary": "ML risk assessment available; GPT-4o brief unavailable (missing OPENAI_API_KEY or API error).",
            "keyFactors": risk_prediction.get("top_drivers", [])[:5],
            "industries": [],
            "watchList": [],
            "causalChain": [],
            "lastUpdated": datetime.utcnow().isoformat() + "Z",
        }

    result = {
        **brief,
        "subScores": _country_sub_scores(features),
        "mlMetadata": {
            "riskScore": risk_prediction["risk_score"],
            "confidence": risk_prediction["confidence"],
            "riskLevel": risk_prediction["risk_level"],
            "anomalyDetected": anomaly["is_anomaly"],
            "anomalyScore": anomaly["anomaly_score"],
            "sentimentLabel": finbert_results.get("dominant_sentiment", "neutral"),
            "escalatoryPct": finbert_results.get("headline_escalatory_pct", 0),
            "topDrivers": risk_prediction.get("top_drivers", []),
            "dataSources": ["GDELT", "ACLED", "UCDP", "World Bank", "NewsAPI.ai"],
            "modelVersion": MODEL_VERSION,
        },
    }
    _cache[country_code] = result
    _cache_ttl[country_code] = datetime.utcnow()
    return result


@app.post("/api/risk-score")
async def api_risk_score(request: RiskScoreRequest):
    country_code = request.countryCode.strip().upper()
    _validate_country(country_code)
    country = request.country

    headlines = await fetch_headlines(country)
    finbert_results = analyze_headlines_sentiment(headlines)
    gdelt_df = load_gdelt_cache(country_code)
    acled_df = load_acled_cache(country)
    ucdp_df = load_ucdp_cache(country)
    wb_features = load_wb_cache(country_code)
    pipeline = SentinelFeaturePipeline(country_code, country)
    features = pipeline.compute(gdelt_df, acled_df, ucdp_df, wb_features, headlines, finbert_results)

    try:
        risk_prediction = predict_risk(features)
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Risk scorer not trained. Run: python -m backend.ml.risk_scorer")
    return risk_prediction


@app.get("/api/anomalies")
async def api_anomalies():
    """Return pre-computed anomaly flags for all countries (instant)."""
    if not _country_scores:
        raise HTTPException(status_code=503, detail="Scores not yet computed; wait for backend startup to finish.")
    return [
        {
            "countryCode": code,
            "country": c["name"],
            "isAnomaly": c["isAnomaly"],
            "anomalyScore": c["anomalyScore"],
            "severity": c["severity"],
        }
        for code, c in _country_scores.items()
    ]


@app.post("/api/forecast")
async def api_forecast(request: ForecastRequest):
    country_code = request.countryCode.strip().upper()
    _validate_country(country_code)
    country = request.country

    gdelt_df = load_gdelt_cache(country_code)
    acled_df = load_acled_cache(country)
    ucdp_df = load_ucdp_cache(country)
    wb_features = load_wb_cache(country_code)
    pipeline = SentinelFeaturePipeline(country_code, country)
    features = pipeline.compute(gdelt_df, acled_df, ucdp_df, wb_features)

    seq = _build_forecast_sequence(features)
    try:
        forecast = forecast_risk(seq)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {
        "countryCode": country_code,
        "country": country,
        **forecast,
    }


@app.get("/api/countries")
async def api_countries():
    """Return pre-computed risk scores for all countries (instant)."""
    if not _country_scores:
        raise HTTPException(status_code=503, detail="Scores not yet computed; wait for backend startup to finish.")
    return [
        {
            "countryCode": code,
            "country": c["name"],
            "riskScore": c["riskScore"],
            "riskLevel": c["riskLevel"],
        }
        for code, c in _country_scores.items()
    ]


@app.get("/api/dashboard/summary", tags=["dashboard"])
async def api_dashboard_summary():
    """Return pre-computed dashboard KPIs (instant; no on-demand computation)."""
    if not _dashboard_summary:
        raise HTTPException(status_code=503, detail="Scores not yet computed; wait for backend startup to finish.")
    return _dashboard_summary


@app.get("/api/dashboard/kpis", tags=["dashboard"])
async def api_dashboard_kpis():
    """Rich KPI data for the frontend dashboard — five blocks, all from cached ML results."""
    global _previous_scores

    if not _country_scores:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=503, content={"status": "warming_up"})

    now = datetime.utcnow().isoformat() + "Z"

    # ---- 1. Global Threat Index ----
    country_entries = []
    for code, c in _country_scores.items():
        prev = _previous_scores.get(code, {})
        delta = c["riskScore"] - prev.get("riskScore", c["riskScore"])
        country_entries.append({"country": c["name"], "code": code, "score": c["riskScore"], "delta": delta})

    all_scores = [e["score"] for e in country_entries]
    gti = round(sum(all_scores) / len(all_scores)) if all_scores else 0
    prev_gti = _previous_scores.get("_gti", gti)
    gti_delta = gti - prev_gti
    trend = "ESCALATING" if gti_delta > 3 else ("DE-ESCALATING" if gti_delta < -3 else "STABLE")
    top_contributors = sorted(country_entries, key=lambda e: e["score"], reverse=True)[:3]

    global_threat_index = {
        "score": gti,
        "delta24h": gti_delta,
        "trend": trend,
        "topContributors": top_contributors,
    }

    # ---- 2. Active Anomalies ----
    anomaly_countries = []
    by_severity = {"HIGH": 0, "MED": 0, "LOW": 0}

    for code, c in _country_scores.items():
        if c["isAnomaly"]:
            sev = c["severity"]
            by_severity[sev] = by_severity.get(sev, 0) + 1
            trigger = _get_anomaly_trigger(code, c["features"])
            anomaly_countries.append({
                "code": code,
                "name": c["name"],
                "severity": sev,
                "score": c["anomalyScore"],
                "trigger": trigger,
            })

    anomaly_countries.sort(key=lambda x: x["score"], reverse=True)
    active_anomalies = {
        "total": len(anomaly_countries),
        "bySeverity": by_severity,
        "countries": anomaly_countries,
    }

    # ---- 3. Risk Distribution ----
    distribution = {"CRITICAL": 0, "HIGH": 0, "ELEVATED": 0, "MODERATE": 0, "LOW": 0}
    recent_changes: list[dict] = []

    for code, c in _country_scores.items():
        level = c["riskLevel"]
        distribution[level] = distribution.get(level, 0) + 1

        prev = _previous_scores.get(code, {})
        prev_level = prev.get("riskLevel")
        if prev_level and prev_level != level and RISK_TIER_ORDER.get(level, 0) > RISK_TIER_ORDER.get(prev_level, 0):
            recent_changes.append({
                "country": c["name"], "code": code,
                "from": prev_level, "to": level, "changedAt": now,
            })

    risk_distribution = {
        "distribution": distribution,
        "totalCountries": len(_country_scores),
        "recentChanges": recent_changes,
    }

    # ---- 3b. Regional Breakdown (from real country scores + region from MONITORED_COUNTRIES) ----
    region_agg: dict[str, list[dict]] = {}
    for code, c in _country_scores.items():
        region = MONITORED_COUNTRIES.get(code, {}).get("region") or "Other"
        if region not in region_agg:
            region_agg[region] = []
        region_agg[region].append({
            "riskScore": c["riskScore"],
            "isAnomaly": c["isAnomaly"],
        })
    regional_breakdown = []
    for region, items in region_agg.items():
        scores = [x["riskScore"] for x in items]
        avg_risk = round(sum(scores) / len(scores)) if scores else 0
        anomalies = sum(1 for x in items if x["isAnomaly"])
        # Escalations: count countries that moved up in tier (from recent_changes in this region)
        region_codes = {code for code, c in _country_scores.items()
                        if (MONITORED_COUNTRIES.get(code, {}).get("region") or "Other") == region}
        escalations = sum(1 for ch in recent_changes if ch.get("code") in region_codes)
        regional_breakdown.append({
            "region": region,
            "avgRisk": avg_risk,
            "anomalies": anomalies,
            "escalations": escalations,
            "countries": len(items),
        })
    regional_breakdown.sort(key=lambda r: r["avgRisk"], reverse=True)

    # ---- 4. Escalation Alerts ----
    alerts = _build_escalation_alerts(now)
    escalation_alerts = {"count": len(alerts), "alerts": [{"type": a["type"], "country": a["country"], "code": a["code"], "detail": a["detail"], "time": a["time"]} for a in alerts]}

    # ---- 5. Sources Active ----
    sources = _build_sources_active()
    sources_active = {
        "active": sum(1 for s in sources if s["status"] in ("LIVE", "LOADED")),
        "total": len(sources),
        "sources": sources,
    }

    # ---- Persist current scores for next delta computation ----
    new_prev: dict = {"_gti": gti}
    for code, c in _country_scores.items():
        new_prev[code] = {"riskScore": c["riskScore"], "riskLevel": c["riskLevel"]}
    _previous_scores = new_prev

    model_accuracy = _dashboard_summary.get("modelHealth", 98.0) if _dashboard_summary else 98.0
    return {
        "globalThreatIndex": global_threat_index,
        "activeAnomalies": active_anomalies,
        "riskDistribution": risk_distribution,
        "regionalBreakdown": regional_breakdown,
        "escalationAlerts": escalation_alerts,
        "sourcesActive": sources_active,
        "modelAccuracy": model_accuracy,
        "computedAt": now,
    }


@app.get("/api/dashboard/alerts", tags=["dashboard"])
async def api_dashboard_alerts():
    """Real escalation alerts for the Alert Feed: tier changes, score spikes, anomalies. No placeholders."""
    if not _country_scores:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=503, content={"status": "warming_up"})
    now = datetime.utcnow().isoformat() + "Z"
    alerts = _build_escalation_alerts(now)
    return {"alerts": alerts, "computedAt": now}


@app.get("/api/dashboard/sub-scores", tags=["dashboard"])
async def api_dashboard_sub_scores():
    """Aggregate sub-scores from cached ML features: Conflict, Social Unrest, Economic, Humanitarian, Media. No placeholders."""
    global _previous_sub_scores
    if not _country_scores:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=503, content={"status": "warming_up"})
    current = _compute_sub_scores()
    if not current:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=503, content={"status": "warming_up"})
    # Deltas vs previous run
    prev = _previous_sub_scores
    sub_scores = {
        "conflictIntensity": {
            "value": current["conflictIntensity"],
            "delta": current["conflictIntensity"] - prev.get("conflictIntensity", current["conflictIntensity"]),
            "description": "Armed events, fatalities, Goldstein",
            "drivers": ["acled_fatalities_30d", "acled_battle_count", "gdelt_goldstein_mean"],
        },
        "socialUnrest": {
            "value": current["socialUnrest"],
            "delta": current["socialUnrest"] - prev.get("socialUnrest", current["socialUnrest"]),
            "description": "Protests, civil tension, event volatility",
            "drivers": ["acled_protest_count", "acled_civilian_violence", "gdelt_volatility"],
        },
        "economicStress": {
            "value": current["economicStress"],
            "delta": current["economicStress"] - prev.get("economicStress", current["economicStress"]),
            "description": "Inflation, GDP, FDI (World Bank)",
            "drivers": ["econ_composite_score", "wb_inflation_latest", "wb_gdp_growth_latest"],
        },
        "humanitarian": {
            "value": current["humanitarian"],
            "delta": current["humanitarian"] - prev.get("humanitarian", current["humanitarian"]),
            "description": "Civilian impact, UCDP",
            "drivers": ["ucdp_civilian_deaths", "ucdp_conflict_intensity", "ucdp_total_deaths"],
        },
        "mediaSentiment": {
            "value": current["mediaSentiment"],
            "delta": current["mediaSentiment"] - prev.get("mediaSentiment", current["mediaSentiment"]),
            "description": "Headline tone, escalatory %",
            "drivers": ["finbert_negative_score", "headline_escalatory_pct", "media_negativity_index"],
        },
    }
    _previous_sub_scores = dict(current)
    return {"subScores": sub_scores, "computedAt": datetime.utcnow().isoformat() + "Z"}


@app.get("/api/dashboard/kpis/history", tags=["dashboard"])
async def api_dashboard_kpis_history():
    """Real KPI history: one point per precompute run (startup + every 15 min). No mock data."""
    return {
        "globalThreatIndex": {"period": "7D", "values": [h["globalThreatIndex"] for h in _kpi_history]},
        "activeAnomalies": {"period": "7D", "values": [h["activeAnomalies"] for h in _kpi_history]},
        "highPlusCountries": {"period": "7D", "values": [h["highPlusCountries"] for h in _kpi_history]},
        "escalationAlerts": {"period": "7D", "values": [h["escalationAlerts"] for h in _kpi_history]},
        "modelAccuracy": {"period": "12W", "values": [h["modelAccuracy"] for h in _kpi_history]},
        "sourcesActive": {"period": "7D", "values": [h["sourcesActive"] for h in _kpi_history]},
    }


@app.get("/api/recent-activity")
async def api_recent_activity():
    """Live recent activity feed from NewsAPI (top-headlines)."""
    items, error = await fetch_recent_activity(limit=20)
    out = {"items": items}
    if error:
        out["error"] = error
    return out


@app.get("/api/track-record")
async def api_track_record():
    record = tracker.get_track_record(limit=20)
    accuracy = tracker.compute_accuracy(days_back=90)
    return {"predictions": record, "accuracy": accuracy}
