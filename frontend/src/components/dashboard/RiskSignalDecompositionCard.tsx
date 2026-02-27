"use client";

import { useState, useEffect } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { HelpCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { AnalyzeSubScores } from "@/lib/types";

const DIMENSIONS = [
  { key: "conflictIntensity" as const, label: "Conflict", fullLabel: "Armed events, fatalities, Goldstein" },
  { key: "socialUnrest" as const, label: "Unrest", fullLabel: "Protests, riots, civil tension" },
  { key: "economicStress" as const, label: "Economic", fullLabel: "Inflation, GDP, FDI (World Bank)" },
  { key: "humanitarian" as const, label: "Humanitarian", fullLabel: "Civilian casualties (UCDP)" },
  { key: "mediaSentiment" as const, label: "Sentiment", fullLabel: "Headline tone, escalatory %" },
];

const RISK_LEVEL_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  ELEVATED: "#f97316",
  HIGH: "#ef4444",
  CRITICAL: "#991b1b",
};

interface RiskSignalDecompositionCardProps {
  /** When set, fetch /api/analyze for this country and show its subScores. */
  countryName: string | null;
  countryCode: string | null;
  /** Optional risk level for radar color (from dashboard country or analyze result). */
  riskLevel?: string;
}

export function RiskSignalDecompositionCard({
  countryName,
  countryCode,
  riskLevel = "ELEVATED",
}: RiskSignalDecompositionCardProps) {
  const [subScores, setSubScores] = useState<AnalyzeSubScores | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!countryName || !countryCode) {
      setSubScores(null);
      setError(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    api
      .analyzeCountry(countryName, countryCode)
      .then((res) => {
        if (!cancelled && res.subScores) setSubScores(res.subScores);
        if (!cancelled && !res.subScores) setError(true);
      })
      .catch(() => {
        if (!cancelled) {
          setSubScores(null);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [countryName, countryCode]);

  const chartData = DIMENSIONS.map((d) => ({
    dimension: d.label,
    value: subScores?.[d.key] ?? 0,
    fullMark: 100,
  }));

  const fillColor = RISK_LEVEL_COLORS[riskLevel] ?? "#2563eb";
  const gridStroke = "#e5e7eb";
  const tickFill = "#6b7280";

  const showChart = countryName && countryCode && !error;
  const isLoading = loading && !subScores;

  return (
    <div
      className="bg-white rounded-md border border-slate-300 flex flex-col h-full min-h-0"
      style={{ padding: "12px 14px" }}
    >
      <div className="flex items-center gap-1.5 shrink-0 mb-2">
        <p
          className="text-xs uppercase text-slate-500 font-medium"
          style={{ letterSpacing: "0.06em" }}
        >
          Risk Signal Decomposition
        </p>
        <span
          className="text-slate-400 cursor-help"
          title="ML-computed sub-dimensions of overall risk score"
        >
          <HelpCircle size={12} />
        </span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col" style={{ opacity: loading ? 0.85 : 1 }}>
        {error && !subScores && (
          <p className="text-sm text-red-600 py-2">Sub-scores unavailable.</p>
        )}
        {!countryName && !countryCode && (
          <p className="text-sm text-slate-500 py-2">No country selected.</p>
        )}
        {showChart && (
          <>
            <div className="w-full" style={{ height: 220 }}>
              {isLoading ? (
                <div
                  className="w-full h-full flex items-center justify-center rounded border border-slate-100 bg-slate-50/50"
                  style={{ minHeight: 220 }}
                >
                  <span className="text-sm text-slate-500">Loading…</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <PolarGrid stroke={gridStroke} strokeOpacity={0.5} />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fontSize: 11, fill: tickFill }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fontSize: 9, fill: tickFill }}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke={fillColor}
                      fill={fillColor}
                      fillOpacity={0.35}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 shrink-0 mt-2 pt-2 border-t border-slate-100 text-[10px] font-medium text-slate-500">
              {DIMENSIONS.map((d) => (
                <span key={d.key}>
                  {d.label}:{" "}
                  <span className="font-semibold text-slate-700 tabular-nums">
                    {subScores?.[d.key] ?? "—"}
                  </span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
