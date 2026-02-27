# Sentinel AI Dashboard — Progress

## Headlines: GDELT DOC 2.0 primary, NewsAPI fallback ✅

**Completed:** Headline fetching no longer requires an API key. GDELT DOC 2.0 is the primary source; NewsAPI is used only as fallback when configured.

### Implemented

- **fetch_headlines()** in `backend/main.py` now:
  1. Calls GDELT DOC 2.0 API via `httpx.AsyncClient`: `https://api.gdeltproject.org/api/v2/doc/doc?query={country}&mode=artlist&maxrecords=15&format=json&timespan=24h` (then retries with `timespan=7d` if no articles).
  2. Parses `response.json()["articles"]` and extracts the `title` field from each.
  3. If GDELT fails or returns no articles, falls back to existing NewsAPI.org logic when `NEWSAPI_KEY` (or `NEWS_API`, `NEW_API`, `NEWS_API_KEY`) is set.
  4. If both fail, returns an empty list (unchanged behavior for downstream FinBERT/GPT-4o).
- Removed hard dependency on `NEWS_API` env var: no startup warning when unset; backend starts without errors with no env vars.
- No changes to FinBERT, GPT-4o, or the rest of the pipeline; they already consume `list[str]` headlines.

### Validation

- `fetch_headlines("Ukraine")` returns ≥5 titles when GDELT has coverage.
- `fetch_headlines("Taiwan")` returns ≥5 titles when GDELT has coverage.
- Works with no env vars set (GDELT only).
- Backend starts without errors.
- `POST /api/analyze {"country": "Ukraine", "countryCode": "UA"}` returns populated `mlMetadata.sentimentLabel` when headlines are returned.

### Files changed

- `backend/main.py` — GDELT primary + NewsAPI fallback in `fetch_headlines()`, removed NEWS_API startup warning, added `urllib.parse` for query encoding.

---

## Issue #2: Mapbox Dark Style + Pulsing Risk Markers ✅

**Completed:** Map globe visualization upgraded to a cinematic, defense-grade command center style.

### Implemented

- **Step 1 — Dark map style:** Mapbox style set to `mapbox://styles/mapbox/dark-v11`. Removed light-style overrides so the map uses the built-in dark theme (dark ocean, dark land).
- **Step 2 — Pulsing CSS:** Added `pulse-critical`, `pulse-high`, and `pulse-elevated` keyframes and `.marker-critical`, `.marker-high`, `.marker-elevated`, `.marker-moderate`, `.marker-low` classes in `frontend/src/app/globals.css`.
- **Step 3 — Marker classes by risk:** Risk markers use `getMarkerClass(riskLevel)` so CRITICAL/HIGH/ELEVATED/MODERATE/LOW map to the corresponding CSS classes.
- **Step 4 — Marker size by score:** `getMarkerSize(riskScore)` scales markers between 8–20px based on risk score (0–100).
- **Step 5 — Tooltips on hover:** Marker hover shows a dark tooltip (`.sentinel-popup`) with country name and score; country-fill hover popup restyled to the same dark theme. Popup CSS overrides in `globals.css` (transparent content, no tip).
- **Step 6 — Heatmap layer:** Added `risk-heatmap` GeoJSON source and `risk-heat` heatmap layer (inserted before `country-fill`) with weight by `riskScore`, color ramp yellow → orange → red, and zoom-based intensity/radius/opacity.
- **Step 7 — Legend:** Replaced small bottom legend with a floating dark overlay (`GlobeLegend.tsx`): `bg-zinc-900/90`, border, CRITICAL/HIGH with pulse, ELEVATED/MODERATE/LOW static, plus Events/Facilities/Trade Routes.
- **Step 8 — Countries monitored badge:** Added “201 countries monitored” badge at bottom-right (`frontend/src/app/globe/page.tsx`), styled as dark pill with `bg-zinc-900/80` and border.
- **Step 9 — Staggered animations:** Each risk marker gets `el.style.animationDelay = \`${Math.random() * 2}s\`` so pulsing is not synchronized.

### Files changed

- `frontend/src/app/globals.css` — Pulsing keyframes, marker classes, sentinel-popup overrides.
- `frontend/src/components/globe/GlobeMap.tsx` — Dark style, heatmap, DOM markers with classes/size/tooltips/click, marker popup, dark container.
- `frontend/src/components/globe/GlobeLegend.tsx` — New dark floating legend with risk levels and layer items.
- `frontend/src/app/globe/page.tsx` — Dark map container, countries badge, dark loading placeholder.

### Validation checklist

- [x] Mapbox globe uses `dark-v11` style.
- [x] CRITICAL markers pulse red with glow; HIGH pulse orange; ELEVATED subtle amber.
- [x] MODERATE and LOW markers static but visible.
- [x] Marker sizes vary by risk score (8–20px).
- [x] Hover shows dark tooltip with country name and score.
- [x] Staggered animation delays on markers.
- [x] Legend is floating dark overlay (bottom-left).
- [x] No white flash on load (container and placeholder use dark background).
- [x] Clicking a marker triggers country selection (intelligence brief panel when watchlist country).

---

## Issue #3: KPI Cards Visual Upgrade — Glow Borders + Filled Values ✅

**Completed:** Top KPI row upgraded to enterprise-grade (Bloomberg/Palantir-style) with severity-colored borders, filled values for all 6 cards, and optional mini-sparklines.

### Implemented

- **Step 1 — Located KPI component:** `frontend/src/components/dashboard/KpiStrip.tsx` (previously 5 cards, light styling).
- **Step 2 — KPI data structure:** All 6 cards now have defined values: Global Threat Index (with delta + sparkline), Active Anomalies, HIGH+ Countries (derived from `riskDistribution.distribution` CRITICAL + HIGH), Escalation Alerts 24H, Model Accuracy (from `MODEL_PERFORMANCE` last value, e.g. 98.2%), Sources Active (e.g. 6/6 with fallback).
- **Step 3 — KPICard component:** New card with `bg-zinc-900/80`, `border border-zinc-800`, colored left border (`border-l-4`), large bold value (`text-3xl`), color-coded text and subtle glow (`drop-shadow-[0_0_8px_...]`), uppercase zinc-500 label, optional delta (▲/▼), hover state (`hover:bg-zinc-800/50`).
- **Step 4 — MiniSparkline:** SVG-based sparkline (80×20) for Global Threat Index using `KPI_SPARKLINE_DATA[0]`; stroke color by severity (red/orange/amber/emerald).
- **Step 5 — Grid:** `grid grid-cols-3 lg:grid-cols-6 gap-3 p-3` so 6 columns on large screens, 3 on smaller.

### Files changed

- `frontend/src/components/dashboard/KpiStrip.tsx` — Replaced with new `MiniSparkline`, `KPICard`, and 6-card data array driven by `DashboardKpis` + `MODEL_PERFORMANCE` / `KPI_SPARKLINE_DATA`.

### Validation checklist

- [x] All 6 KPI cards display filled values (no empty cards).
- [x] Model Accuracy shows e.g. "98.2%" in emerald.
- [x] Sources Active shows "6/6" (or active/total) in emerald.
- [x] Each card has a colored left-border accent matching severity.
- [x] Big numbers are large (text-3xl), bold, and color-coded.
- [x] Numbers have subtle glow/drop-shadow on dark background.
- [x] Labels are small, uppercase, zinc-500, tracking-wider.
- [x] Cards have dark backgrounds and subtle border; hover brightens slightly.

---

## Risk Signal Decomposition (Radar Chart) ✅

**Completed:** The "Aggregate Sub-Scores" progress-bar card was replaced with a "Risk Signal Decomposition" radar (spider) chart showing 5 ML sub-dimensions of the country's overall risk score.

### Backend (`backend/main.py`)

- **`_country_sub_scores(features)`** added: returns per-country sub-scores from pipeline features with normalized scales.
  - `conflictIntensity`: `conflict_composite` capped at 100.
  - `socialUnrest`: `(acled_protest_count / 50) * 100` capped at 100 (fixes scale so it is not stuck at 100).
  - `economicStress`: `econ_composite_score` capped at 100.
  - `humanitarian`: `humanitarian_score` capped at 100.
  - `mediaSentiment`: `media_negativity_index * 100 + headline_escalatory_pct * 100` capped at 100 (fixes previously 0 value).
- **`/api/analyze`** response now includes **`subScores`** (the above five keys). Cache returns also get `subScores` computed from current `c["features"]` so cached responses always include it.

### Frontend

- **`RiskSignalDecompositionCard`** (`frontend/src/components/dashboard/RiskSignalDecompositionCard.tsx`): Recharts `RadarChart` with 5 dimensions (Conflict, Unrest, Economic, Humanitarian, Sentiment). Fetches `POST /api/analyze` when `countryName`/`countryCode` are set; uses `subScores` for radar data. Styled with risk-level color (fill + stroke), subtle grid, and a compact legend row (dimension name + score). Card title "RISK SIGNAL DECOMPOSITION" with "?" tooltip: "ML-computed sub-dimensions of overall risk score."
- **Dashboard:** Replaced `SubScoresCard` with `RiskSignalDecompositionCard`; focus country is the first in `data.countries` (top risk). Same card size/layout slot.
- **Globe detail panel:** Replaced the 3-bar "Sub-Scores" block with `RiskSignalDecompositionCard` so when a user clicks a country on the map, the radar appears in that panel.
- **Types:** `AnalyzeSubScores` and `AnalyzeResult.subScores` added in `frontend/src/lib/types.ts`.

### Validation

- Backend: `POST /api/analyze` with `{"country": "Ukraine", "countryCode": "UA"}` returns a `subScores` object with all 5 keys.
- Conflict countries (e.g. Ukraine) show non-zero values across dimensions.
- `mediaSentiment` and `socialUnrest` no longer stuck at 0 or 100 respectively.
- Dashboard: "Risk Signal Decomposition" radar appears in place of Aggregate Sub-Scores; shows top country's decomposition.
- Globe: Clicking a country on the map shows the radar in the detail panel.

### Files changed

- `backend/main.py` — `_country_sub_scores()`, `subScores` in analyze result and cache return.
- `frontend/src/lib/types.ts` — `AnalyzeSubScores`, `AnalyzeResult.subScores`.
- `frontend/src/components/dashboard/RiskSignalDecompositionCard.tsx` — New radar card (Recharts).
- `frontend/src/app/dashboard/page.tsx` — Use `RiskSignalDecompositionCard` instead of `SubScoresCard`.
- `frontend/src/components/globe/GlobeDetailPanel.tsx` — Sub-scores bars replaced by `RiskSignalDecompositionCard`.
