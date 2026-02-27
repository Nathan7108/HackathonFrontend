"use client";

import type { DashboardSubScores, SubScoreItem } from "@/lib/types";

const SECTION_CONFIG: { key: keyof DashboardSubScores["subScores"]; label: string; color: string }[] = [
  { key: "conflictIntensity", label: "Conflict Intensity", color: "#b91c1c" },
  { key: "socialUnrest", label: "Social Unrest", color: "#c2410c" },
  { key: "economicStress", label: "Economic Stress", color: "#a16207" },
  { key: "humanitarian", label: "Humanitarian", color: "#be123c" },
  { key: "mediaSentiment", label: "Media & Sentiment", color: "#6b21a8" },
];

interface SubScoresCardProps {
  data: DashboardSubScores | null;
  loading: boolean;
  error: boolean;
}

function BarRow({ label, item, color }: { label: string; item: SubScoreItem; color: string }) {
  const deltaRounded = Math.round(Number(item.delta));
  const showDelta = deltaRounded !== 0;
  return (
    <div className="flex flex-col gap-1 shrink-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <div className="flex items-center gap-2 shrink-0">
          {showDelta && (
            <span className={`text-xs font-medium tabular-nums ${deltaRounded > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {deltaRounded > 0 ? "+" : ""}{deltaRounded}
            </span>
          )}
          <span className="text-base font-bold tabular-nums" style={{ color }}>{item.value}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 leading-tight">{item.description}</p>
      <div className="w-full h-2 rounded-sm bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-sm transition-all"
          style={{ width: `${Math.min(100, item.value)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function SubScoresCard({ data, loading, error }: SubScoresCardProps) {
  const subScores = data?.subScores;

  return (
    <div
      className="bg-white rounded-md border border-slate-300 flex flex-col h-full min-h-0"
      style={{ padding: "12px 14px" }}
    >
      <p
        className="text-xs uppercase text-slate-500 font-medium shrink-0"
        style={{ letterSpacing: "0.06em", marginBottom: 10 }}
      >
        Aggregate Sub-Scores
      </p>

      <div
        className="flex-1 min-h-0 overflow-auto flex flex-col"
        style={{ gap: 14, opacity: loading ? 0.6 : 1 }}
      >
        {error && (
          <p className="text-sm text-red-600">Sub-scores unavailable.</p>
        )}
        {!error && !subScores && !loading && (
          <p className="text-sm text-slate-500">No data.</p>
        )}
        {!error && subScores && SECTION_CONFIG.map(({ key, label, color }) => (
          <BarRow key={key} label={label} item={subScores[key]} color={color} />
        ))}
      </div>
    </div>
  );
}
