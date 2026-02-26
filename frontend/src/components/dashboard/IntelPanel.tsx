"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ACTIVE_COUNTRIES } from "@/lib/placeholder-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Tab = "brief" | "headlines" | "forecast";

const MOCK_HEADLINES = [
  { text: "Russian forces intensify strikes on energy infrastructure", sentiment: "negative" as const, time: "14:32", source: "Reuters" },
  { text: "EU announces new sanctions package targeting defense sector", sentiment: "negative" as const, time: "13:15", source: "AFP" },
  { text: "Ceasefire negotiations stall as both sides report violations", sentiment: "negative" as const, time: "12:48", source: "AP" },
  { text: "IMF warns of deepening economic contraction in conflict zones", sentiment: "negative" as const, time: "11:22", source: "Reuters" },
  { text: "Humanitarian corridor agreement reached for civilian evacuation", sentiment: "positive" as const, time: "10:05", source: "UN OCHA" },
  { text: "NATO defense ministers meet to discuss eastern flank security", sentiment: "neutral" as const, time: "09:40", source: "NATO" },
  { text: "IAEA inspectors complete routine nuclear facility assessment", sentiment: "neutral" as const, time: "08:18", source: "IAEA" },
  { text: "Regional trade agreement shows progress despite tensions", sentiment: "positive" as const, time: "07:55", source: "Bloomberg" },
  { text: "Energy prices spike as supply concerns mount", sentiment: "negative" as const, time: "06:30", source: "FT" },
  { text: "Central bank signals rate hold amid inflation data", sentiment: "neutral" as const, time: "05:12", source: "Reuters" },
];

const SENTIMENT_DOT: Record<string, string> = {
  negative: "#ef4444",
  neutral: "#9ca3af",
  positive: "#22c55e",
};

const TREND_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  ESCALATING: { bg: "#fef2f2", color: "#dc2626", label: "ESCALATING" },
  STABLE: { bg: "#fefce8", color: "#ca8a04", label: "STABLE" },
  "DE-ESCALATING": { bg: "#f0fdf4", color: "#16a34a", label: "DE-ESC" },
};

const RISK_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#ca8a04",
  ELEVATED: "#ea580c",
  HIGH: "#dc2626",
  CRITICAL: "#991b1b",
};

export function IntelPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("brief");

  const topCountry = ACTIVE_COUNTRIES[0];

  const forecastData = useMemo(() => {
    const base = topCountry.riskScore;
    return Array.from({ length: 180 }, (_, i) => {
      const isHistory = i < 90;
      const score = isHistory
        ? Math.round(base - 15 + Math.sin(i * 0.08) * 8 + (i / 90) * 15 + Math.random() * 3)
        : i < 120
          ? topCountry.forecast.score30d + Math.round(Math.sin(i * 0.1) * 3)
          : i < 150
            ? topCountry.forecast.score60d + Math.round(Math.sin(i * 0.1) * 3)
            : topCountry.forecast.score90d + Math.round(Math.sin(i * 0.1) * 3);

      return {
        day: i,
        score: Math.max(0, Math.min(100, score)),
        upper: !isHistory ? Math.min(100, topCountry.forecast.score90d + 8 + Math.random() * 2) : undefined,
        lower: !isHistory ? Math.max(0, topCountry.forecast.score30d - 8 - Math.random() * 2) : undefined,
      };
    });
  }, [topCountry]);

  const trendInfo = TREND_BADGE[topCountry.forecast.trend] || TREND_BADGE["STABLE"];
  const riskColor = RISK_COLORS[topCountry.riskLevel];

  const subScores = [
    { label: "Conflict Intensity", value: topCountry.subScores.conflictIntensity, emoji: "🔴" },
    { label: "Social Unrest", value: topCountry.subScores.socialUnrest, emoji: "🟠" },
    { label: "Economic Stress", value: topCountry.subScores.economicStress, emoji: "🟡" },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "brief", label: "BRIEF" },
    { id: "headlines", label: "HEADLINES" },
    { id: "forecast", label: "FORECAST" },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Tab header */}
      <div className="flex border-b border-gray-200 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors"
            style={{
              color: activeTab === tab.id ? "#2563eb" : "#6b7280",
              borderBottom: activeTab === tab.id ? "2px solid #2563eb" : "2px solid transparent",
              background: "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — fixed height area, scroll inside like watchlist */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin px-3 py-3 flex flex-col">
        {/* BRIEF TAB */}
        {activeTab === "brief" && (
          <div className="space-y-4">
            {/* Hero score + country */}
            <div className="flex items-start gap-3">
              <span
                className="font-black leading-none shrink-0"
                style={{ color: riskColor, fontVariantNumeric: "tabular-nums", fontSize: 48 }}
              >
                {topCountry.riskScore}
              </span>
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ background: RISK_COLORS[topCountry.riskLevel] + "22", color: riskColor }}
                  >
                    {topCountry.riskLevel}
                  </span>
                  <span className="text-xs text-red-600 font-semibold tabular-nums">▲ +3 30d</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">{topCountry.flag}</span>
                  <span className="text-sm font-semibold text-gray-800">{topCountry.name}</span>
                </div>
                <p className="text-xs text-gray-500">
                  ML confidence {Math.round(topCountry.confidence * 100)}% · Model {topCountry.mlMetadata.modelVersion}
                </p>
              </div>
            </div>

            {/* Sub-scores */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Component scores</p>
              <div className="space-y-2">
                {subScores.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-700">{s.emoji} {s.label}</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: riskColor }}>{s.value}/100</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Assessment</p>
              <p className="text-[13px] text-gray-700 leading-relaxed">
                {topCountry.briefText[0] ||
                  "ML models detect sustained escalation across conflict and economic indicators. Anomaly detector flagged 3.2σ deviation from baseline."}
              </p>
            </div>

            {/* Top drivers */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Top ML drivers</p>
              <p className="text-xs text-gray-600 font-mono leading-relaxed">
                {topCountry.mlMetadata.topDrivers.length > 0
                  ? topCountry.mlMetadata.topDrivers.join(" · ")
                  : "acled_battle_count · acled_fatalities · gdelt_goldstein"}
              </p>
            </div>

            {/* Industry & actors */}
            <div className="grid grid-cols-1 gap-2">
              {topCountry.industryExposure?.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Industry exposure</p>
                  <p className="text-xs text-gray-600">{topCountry.industryExposure.join(" · ")}</p>
                </div>
              )}
              {topCountry.keyActors?.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Key actors</p>
                  <p className="text-xs text-gray-600">{topCountry.keyActors.join(" · ")}</p>
                </div>
              )}
            </div>

            <Link
              href={`/country/${topCountry.code}`}
              className="inline-block text-sm font-semibold text-blue-600 hover:underline mt-1"
            >
              View full analysis →
            </Link>
          </div>
        )}

        {/* HEADLINES TAB */}
        {activeTab === "headlines" && (
          <div className="space-y-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Latest intel</p>
            {MOCK_HEADLINES.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-2 py-2.5 border-b border-gray-100 last:border-0"
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
                  style={{ background: SENTIMENT_DOT[h.sentiment] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-gray-800 leading-snug">{h.text}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                    <span className="tabular-nums">{h.time}</span>
                    <span>·</span>
                    <span>{h.source}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FORECAST TAB — chart fills remaining card space, no clip */}
        {activeTab === "forecast" && (
          <div className="flex flex-col h-full min-h-0 gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 shrink-0 pb-1">Risk trajectory · {topCountry.name}</p>
            {/* Chart takes all remaining space; extra top margin so title doesn't clip chart */}
            <div className="flex-1 min-h-0 w-full overflow-hidden mt-0.5" style={{ minHeight: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 20, right: 8, left: 4, bottom: 4 }}>
                  <XAxis dataKey="day" hide />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} width={32} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, padding: "6px 10px", borderRadius: 6 }}
                    formatter={(v) => [v, "Score"]}
                  />
                  <ReferenceLine
                    x={90}
                    stroke="#9ca3af"
                    strokeDasharray="3 3"
                    label={{ value: "TODAY", position: "top", fontSize: 9, fill: "#6b7280" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    fill="none"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="#93c5fd"
                    fillOpacity={0.25}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="#ffffff"
                    fillOpacity={1}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Forecast values — fixed at bottom of tab */}
            <div className="flex items-center gap-4 flex-wrap shrink-0">
              {[
                { label: "30d", value: topCountry.forecast.score30d },
                { label: "60d", value: topCountry.forecast.score60d },
                { label: "90d", value: topCountry.forecast.score90d },
              ].map((f) => (
                <div key={f.label} className="flex flex-col">
                  <span className="text-[11px] text-gray-400 uppercase font-medium">{f.label}</span>
                  <span className="text-lg font-bold tabular-nums" style={{ color: riskColor }}>
                    {f.value}
                  </span>
                </div>
              ))}
              <span
                className="text-xs font-bold px-2 py-1 rounded ml-auto"
                style={{ background: trendInfo.bg, color: trendInfo.color }}
              >
                {trendInfo.label}
              </span>
            </div>

            <p className="text-[11px] text-gray-400 shrink-0">
              Forecast based on {topCountry.mlMetadata.dataSources?.join(", ") || "ACLED, GDELT, UCDP"}. Updated 2h ago.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
