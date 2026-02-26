"use client";

import {
  ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts";
import { RISK_DISTRIBUTION, REGIONAL_BREAKDOWN, SENTIMENT_TREND_30D, MODEL_PERFORMANCE } from "@/lib/dashboard-data";

// Muted, editorial palette — less comic-book, more intel report
const RISK_COLORS: Record<string, string> = {
  CRITICAL: "#7f1d1d",
  HIGH:     "#b91c1c",
  ELEVATED: "#c2410c",
  MODERATE: "#a16207",
  LOW:      "#166534",
};

function riskColorByScore(score: number) {
  if (score >= 70) return RISK_COLORS.CRITICAL;
  if (score >= 55) return RISK_COLORS.HIGH;
  if (score >= 40) return RISK_COLORS.ELEVATED;
  if (score >= 25) return RISK_COLORS.MODERATE;
  return RISK_COLORS.LOW;
}

function CardHeader({ title }: { title: string }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.06em] text-slate-500 font-medium shrink-0 mb-2">
      {title}
    </p>
  );
}

// ── Risk Distribution ──────────────────────────────────────────────────────────
function RiskDistributionCard() {
  const total = RISK_DISTRIBUTION.reduce((s, d) => s + d.count, 0);
  const maxCount = Math.max(...RISK_DISTRIBUTION.map((d) => d.count));

  return (
    <div className="bg-white rounded-md border border-slate-200/80 p-4 flex flex-col overflow-hidden h-full min-h-0">
      <CardHeader title="Risk Distribution" />
      <div className="flex-1 flex flex-col justify-between min-h-0 py-0.5">
        {RISK_DISTRIBUTION.map((d) => {
          const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
          const color = RISK_COLORS[d.tier];
          return (
            <div key={d.tier} className="flex items-center gap-2">
              <span
                className="text-[10px] font-medium text-slate-600 shrink-0 w-10"
                style={{ letterSpacing: "0.02em" }}
              >
                {d.tier.slice(0, 3)}
              </span>
              <div className="flex-1 min-w-0 h-2 rounded-sm bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-sm min-w-[2px] transition-[width]"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-slate-700 w-7 text-right shrink-0">
                {d.count}
              </span>
              <span className="text-[10px] text-slate-400 tabular-nums w-8 text-right shrink-0">
                {total > 0 ? Math.round((d.count / total) * 100) : 0}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Regional Breakdown ─────────────────────────────────────────────────────────
function RegionalBreakdownCard() {
  const sorted = [...REGIONAL_BREAKDOWN].sort((a, b) => b.avgRisk - a.avgRisk);

  const ABBR: Record<string, string> = {
    "Middle East":        "Mid. East",
    "Sub-Saharan Africa": "Sub-Sahara",
    "South Asia":         "S. Asia",
    "East Asia":          "E. Asia",
    "Europe":             "Europe",
    "Latin America":      "Lat. Am.",
  };

  return (
    <div className="bg-white rounded-md border border-slate-200/80 p-4 flex flex-col overflow-hidden h-full min-h-0">
      <CardHeader title="Regional Breakdown" />
      <div className="flex-1 flex flex-col justify-between min-h-0 py-0.5">
        {sorted.map((r) => {
          const color = riskColorByScore(r.avgRisk);
          const label = ABBR[r.region] ?? r.region;

          return (
            <div key={r.region} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-600 shrink-0 truncate w-16 font-medium">
                {label}
              </span>
              <div className="flex-1 min-w-0 h-2 rounded-sm bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-sm min-w-[2px]"
                  style={{ width: `${r.avgRisk}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums w-6 text-right shrink-0" style={{ color }}>
                {r.avgRisk}
              </span>
              {r.anomalies > 0 ? (
                <span className="text-[10px] text-amber-700 bg-amber-50/80 font-medium tabular-nums px-1.5 py-0.5 rounded shrink-0">
                  {r.anomalies}
                </span>
              ) : (
                <span className="w-7 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Media Sentiment ────────────────────────────────────────────────────────────
function SentimentGaugeCard() {
  const latest = SENTIMENT_TREND_30D[SENTIMENT_TREND_30D.length - 1];
  const total  = latest.escalatory + latest.neutral + latest.deescalatory;
  const escPct = Math.round((latest.escalatory / total) * 100);
  const neuPct = total > 0 ? Math.round((latest.neutral / total) * 100) : 0;
  const dePct  = total > 0 ? Math.round((latest.deescalatory / total) * 100) : 0;

  const pieData = [
    { name: "Escalatory", value: latest.escalatory, color: "#dc2626", pct: escPct },
    { name: "Neutral",    value: latest.neutral,     color: "#64748b", pct: neuPct },
    { name: "De-escalatory", value: latest.deescalatory, color: "#16a34a", pct: dePct },
  ];

  const trendData = SENTIMENT_TREND_30D.slice(-14).map((d, i) => ({ i, v: d.escalatory }));

  return (
    <div className="bg-white rounded-md border border-slate-200/80 p-4 flex flex-col overflow-hidden h-full min-h-0">
      <div className="shrink-0 mb-3">
        <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Media Sentiment</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Headline tone · last 30 days</p>
      </div>
      <div className="flex items-center gap-4 flex-1 min-h-0">
        {/* Donut */}
        <div className="shrink-0" style={{ width: 100, height: 100 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={30}
                outerRadius={46}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums" style={{ color: "#dc2626" }}>{escPct}%</span>
            <span className="text-xs font-semibold text-red-600">Escalatory</span>
          </div>
          <div className="space-y-1.5">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                  <span className="text-xs text-slate-600">{p.name}</span>
                </div>
                <span className="text-xs font-semibold tabular-nums text-slate-700">{p.pct}%</span>
              </div>
            ))}
          </div>
          {/* Mini trend */}
          <div className="mt-1">
            <p className="text-[10px] text-slate-400 mb-1">Escalatory trend (14d)</p>
            <div style={{ height: 28 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Area type="monotone" dataKey="v" stroke="#dc2626" fill="#dc2626" fillOpacity={0.2} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Model Health ───────────────────────────────────────────────────────────────
function ModelHealthCard() {
  const latest = MODEL_PERFORMANCE[MODEL_PERFORMANCE.length - 1];
  const chartData = MODEL_PERFORMANCE.map((d, i) => ({ i, v: d.accuracy }));

  return (
    <div
      className="rounded-md border border-slate-200/80 overflow-hidden h-full flex flex-col min-h-0 p-4"
      style={{ background: "#f0fdf4" }}
    >
      {/* Header with number */}
      <div className="shrink-0">
        <p className="text-[10px] uppercase tracking-[0.06em] text-green-700 font-medium mb-2">Model Health</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tabular-nums text-green-700">{latest.accuracy}%</span>
          <span className="text-[10px] text-green-600 font-semibold">accuracy</span>
        </div>
        <div className="flex gap-3 mt-0.5">
          <span className="text-[10px] text-green-700">47 features</span>
          <span className="text-[10px] text-green-700">201 models</span>
          <span className="text-[10px] text-green-600 font-bold">✓ 6/6 sources</span>
        </div>
      </div>

      {/* Chart fills the rest */}
      <div className="flex-1 min-h-0 mt-2" style={{ minHeight: 48 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <Area
              type="monotone"
              dataKey="v"
              stroke="#16a34a"
              fill="#16a34a"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Tooltip
              contentStyle={{ fontSize: 9, padding: "2px 4px", borderRadius: 3 }}
              formatter={(v) => [`${v}%`, "Acc"]}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Grid ───────────────────────────────────────────────────────────────────────
export function AnalyticsGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      <RiskDistributionCard />
      <RegionalBreakdownCard />
      <SentimentGaugeCard />
      <ModelHealthCard />
    </div>
  );
}
