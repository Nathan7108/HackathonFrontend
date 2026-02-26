"use client";

import { X, ArrowRight, Radio } from "lucide-react";
import Link from "next/link";
import type { CountryData } from "@/lib/placeholder-data";

const RISK_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  ELEVATED: "#ea580c",
  HIGH: "#ef4444",
  CRITICAL: "#991b1b",
};

const FEATURE_LABELS: Record<string, string> = {
  acled_battle_count: "Armed battles",
  gdelt_goldstein: "Goldstein instability",
  acled_fatalities: "Fatality rate",
  gdelt_event_acceleration: "Event acceleration",
  finbert_negative_score: "Media sentiment",
  acled_protest_count: "Protest activity",
  ucdp_conflict_events: "Conflict events",
  gdelt_tone_shift: "Tone shift",
  acled_military_events: "Military events",
  acled_violence_count: "Violence count",
  gdelt_protest_count: "Protest events",
  acled_civil_unrest: "Civil unrest",
};

const SUB_SCORE_LABELS: Record<string, string> = {
  conflictIntensity: "Conflict Intensity",
  socialUnrest: "Social Unrest",
  economicStress: "Economic Stress",
};

const SUB_SCORE_COLORS: Record<string, string> = {
  conflictIntensity: "#ef4444",
  socialUnrest: "#ea580c",
  economicStress: "#eab308",
};

const HEADLINE_DOTS = ["🔴", "🟠", "🟢", "🔴", "🟡"];

interface Props {
  country: CountryData | null;
  onClose: () => void;
}

export function GlobeDetailPanel({ country, onClose }: Props) {
  if (!country) return null;

  const color = RISK_COLORS[country.riskLevel] ?? "#6b7280";
  const delta = country.riskScore - country.forecast.score30d;

  return (
    <>
      <div className="absolute inset-0 z-20" onClick={onClose} />

      <div
        className="absolute top-0 right-0 bottom-0 z-30 flex flex-col bg-white shadow-xl border-l border-gray-200"
        style={{ width: 340, animation: "slide-in-right 0.22s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header (60px) ────────────────────────────────────────── */}
        <div className="shrink-0 px-4 pt-3 pb-2 border-b border-gray-100" style={{ minHeight: 60 }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">{country.flag}</span>
              <h2 className="text-base font-bold text-gray-900 truncate">{country.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors shrink-0 ml-2"
              aria-label="Close"
            >
              <X size={14} className="text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="text-[28px] font-black tabular-nums leading-none"
              style={{ color }}
            >
              {country.riskScore}
            </span>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded text-white"
              style={{ background: color }}
            >
              {country.riskLevel}
            </span>
            <span
              className="text-[11px] font-medium"
              style={{ color: delta >= 0 ? "#dc2626" : "#16a34a" }}
            >
              {delta > 0 ? `▲${delta}` : delta < 0 ? `▼${Math.abs(delta)}` : "→0"}
            </span>
            {country.anomaly.detected && (
              <div className="flex items-center gap-1 ml-auto">
                <Radio size={10} className="text-red-500 live-pulse shrink-0" />
                <span className="text-[10px] font-semibold text-red-600">ANOMALY</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Stats Bar ──────────────────────────────────────── */}
        <div className="shrink-0 px-4 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2 text-[10px] font-mono text-gray-500">
          <span>
            Confidence:{" "}
            <span className="font-semibold text-gray-700">{Math.round(country.confidence * 100)}%</span>
          </span>
          <span className="text-gray-300">|</span>
          <span>
            Events 24h:{" "}
            <span className="font-semibold text-gray-700">47</span>
          </span>
          <span className="text-gray-300">|</span>
          <span>
            Anomaly:{" "}
            <span className="font-semibold" style={{ color: country.anomaly.detected ? "#dc2626" : "#16a34a" }}>
              {country.anomaly.score.toFixed(2)}{" "}
              {country.anomaly.detected ? country.anomaly.severity : "OK"}
            </span>
          </span>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
          {/* Sub-scores (3 horizontal bars, 20px each) */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              Sub-Scores
            </div>
            <div className="space-y-1.5">
              {(Object.entries(country.subScores) as [string, number][]).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2" style={{ height: 20 }}>
                  <span className="text-[10px] text-gray-500 w-24 shrink-0">
                    {SUB_SCORE_LABELS[key] ?? key}
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${val}%`, background: SUB_SCORE_COLORS[key] ?? color }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-gray-600 w-6 text-right shrink-0">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Forecast */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              Forecast
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "30d", score: country.forecast.score30d },
                { label: "60d", score: country.forecast.score60d },
                { label: "90d", score: country.forecast.score90d },
              ].map(({ label, score }) => (
                <div key={label} className="text-center py-1.5 bg-gray-50 rounded">
                  <div className="text-[9px] text-gray-400 uppercase">{label}</div>
                  <div className="text-sm font-bold tabular-nums" style={{ color }}>
                    {score}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-center font-medium mt-1" style={{ color }}>
              {country.forecast.trend}
            </div>
          </div>

          {/* Intel brief */}
          {country.briefText.length > 0 && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Intel Brief
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">{country.briefText[0]}</p>
            </div>
          )}

          {/* Headlines */}
          {country.headlines.length > 0 && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Headlines
              </div>
              <div className="space-y-0.5">
                {country.headlines.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 py-1 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-[10px] shrink-0 mt-0.5">{HEADLINE_DOTS[i % HEADLINE_DOTS.length]}</span>
                    <span className="text-[11px] text-gray-600 leading-relaxed flex-1">{h}</span>
                    <span className="text-[9px] text-gray-400 font-mono shrink-0 mt-0.5">
                      {i === 0 ? "2h" : i === 1 ? "5h" : "1d"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top ML Drivers */}
          {country.featureImportance.length > 0 && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                Top Risk Drivers
              </div>
              <div className="space-y-1.5">
                {country.featureImportance.map(({ feature, importance }) => (
                  <div key={feature} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-600 flex-1 truncate">
                      {FEATURE_LABELS[feature] ?? feature.replace(/_/g, " ")}
                    </span>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${importance * 100}%`, background: color }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 w-7 text-right shrink-0">
                      {(importance * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer CTA ───────────────────────────────────────────── */}
        <div className="shrink-0 p-3 border-t border-gray-100">
          <Link
            href={`/country/${country.code}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ background: "#2563eb" }}
          >
            VIEW FULL ANALYSIS
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </>
  );
}
