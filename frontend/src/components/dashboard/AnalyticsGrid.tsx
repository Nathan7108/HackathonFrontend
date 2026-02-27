"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { useDashboardData } from "@/lib/hooks/useDashboardData";

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "#7f1d1d",
  HIGH: "#b91c1c",
  ELEVATED: "#c2410c",
  MODERATE: "#a16207",
  LOW: "#166534",
};

function riskColorByScore(score: number) {
  if (score >= 70) return RISK_COLORS.CRITICAL;
  if (score >= 55) return RISK_COLORS.HIGH;
  if (score >= 40) return RISK_COLORS.ELEVATED;
  if (score >= 25) return RISK_COLORS.MODERATE;
  return RISK_COLORS.LOW;
}

const RISK_TIER_ORDER = ["CRITICAL", "HIGH", "ELEVATED", "MODERATE", "LOW"] as const;

// ── Risk Distribution (large card with real data) ─────────────────────────────
function RiskDistributionCard({
  distribution,
  totalCountries,
  recentChanges,
  loading,
}: {
  distribution: Record<string, number>;
  totalCountries: number;
  recentChanges: { country: string; code: string; from: string; to: string; changedAt: string }[];
  loading: boolean;
}) {
  const tiers = RISK_TIER_ORDER.map((tier) => ({ tier, count: distribution[tier] ?? 0 }));
  const total = totalCountries || tiers.reduce((s, d) => s + d.count, 0);
  const maxCount = Math.max(...tiers.map((d) => d.count), 1);
  const highPlus = (distribution["CRITICAL"] ?? 0) + (distribution["HIGH"] ?? 0);

  return (
    <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden flex flex-col min-h-[180px]">
      <div className="px-4 pt-3 pb-1 border-b border-slate-100">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Risk Distribution
        </h3>
        <p className="text-slate-400 text-[10px] mt-0.5">
          {total} countries · {highPlus} HIGH+
        </p>
      </div>
      <div className="flex-1 p-4 flex flex-col min-h-0">
        {loading && (
          <div className="flex-1 flex items-center justify-center text-slate-400 py-6 text-xs">Loading…</div>
        )}
        {!loading && total === 0 && (
          <div className="flex-1 flex items-center justify-center text-slate-400 py-6 text-xs">No data</div>
        )}
        {!loading && total > 0 && (
          <>
            <div className="space-y-2.5 flex-1 min-h-0">
              {tiers.map((d) => {
                const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                const sharePct = total > 0 ? Math.round((d.count / total) * 100) : 0;
                const color = RISK_COLORS[d.tier];
                return (
                  <div key={d.tier} className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-600 shrink-0 w-14" style={{ letterSpacing: "0.03em" }}>
                      {d.tier.slice(0, 3)}
                    </span>
                    <div className="flex-1 min-w-0 h-2.5 rounded bg-slate-100 overflow-hidden">
                      <div className="h-full rounded min-w-[2px] transition-[width]" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-xs font-bold tabular-nums text-slate-800 w-6 text-right shrink-0">{d.count}</span>
                    <span className="text-[10px] text-slate-500 tabular-nums w-6 text-right shrink-0">{sharePct}%</span>
                  </div>
                );
              })}
            </div>
            {recentChanges.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-100">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium mb-1">Recent changes</p>
                <ul className="space-y-0.5 max-h-12 overflow-y-auto">
                  {recentChanges.slice(0, 3).map((ch, i) => (
                    <li key={i} className="text-[10px] text-slate-600 flex items-center gap-1.5">
                      <span className="font-medium text-slate-700 truncate">{ch.country}</span>
                      <span className="text-slate-400 shrink-0">→</span>
                      <span className="font-semibold shrink-0" style={{ color: RISK_COLORS[ch.to] ?? "#64748b" }}>{ch.to}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const REGION_ABBR: Record<string, string> = {
  "Middle East": "Mid. East",
  "Sub-Saharan Africa": "Sub-Sahara",
  "South Asia": "S. Asia",
  "East Asia": "E. Asia",
  "Europe": "Europe",
  "Latin America": "Lat. Am.",
  "Americas": "Americas",
  "Africa": "Africa",
  "Asia": "Asia",
  "Other": "Other",
};

// ── Regional Breakdown (large card with real data) ────────────────────────────
function RegionalBreakdownCard({
  regions,
  loading,
}: {
  regions: { region: string; avgRisk: number; anomalies: number; escalations: number; countries?: number }[];
  loading: boolean;
}) {
  const sorted = [...regions].sort((a, b) => b.avgRisk - a.avgRisk);
  const totalCountries = regions.reduce((s, r) => s + (r.countries ?? 0), 0);

  return (
    <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden flex flex-col min-h-[180px]">
      <div className="px-4 pt-3 pb-1 border-b border-slate-100">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Regional Breakdown
        </h3>
        <p className="text-slate-400 text-[10px] mt-0.5">
          {totalCountries > 0 ? `${totalCountries} countries` : "By region"}
        </p>
      </div>
      <div className="flex-1 p-4 min-h-0 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center text-slate-400 py-6 text-xs">Loading…</div>
        )}
        {!loading && sorted.length === 0 && (
          <div className="flex items-center justify-center text-slate-400 py-6 text-xs">No data</div>
        )}
        {!loading && sorted.length > 0 && (
          <div className="space-y-3">
            {sorted.map((r) => {
              const color = riskColorByScore(r.avgRisk);
              const label = REGION_ABBR[r.region] ?? r.region;
              const n = r.countries ?? 0;
              return (
                <div key={r.region} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-700 truncate">{label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {n > 0 && <span className="text-[9px] text-slate-400 tabular-nums">{n}</span>}
                      {r.anomalies > 0 && (
                        <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">⚠{r.anomalies}</span>
                      )}
                      {r.escalations > 0 && (
                        <span className="text-[9px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">↑{r.escalations}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 h-2.5 rounded bg-slate-100 overflow-hidden">
                      <div className="h-full rounded min-w-[2px]" style={{ width: `${Math.min(r.avgRisk, 100)}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-xs font-bold tabular-nums w-6 text-right shrink-0" style={{ color }}>{r.avgRisk}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Hardcoded trend for media chart (e.g. headline tone / escalatory % over last 14 days)
const MEDIA_CHART_DATA = [
  { day: "D1", escalatory: 38, neutral: 42, deesc: 20 },
  { day: "D2", escalatory: 41, neutral: 40, deesc: 19 },
  { day: "D3", escalatory: 44, neutral: 38, deesc: 18 },
  { day: "D4", escalatory: 42, neutral: 39, deesc: 19 },
  { day: "D5", escalatory: 46, neutral: 37, deesc: 17 },
  { day: "D6", escalatory: 48, neutral: 36, deesc: 16 },
  { day: "D7", escalatory: 45, neutral: 38, deesc: 17 },
  { day: "D8", escalatory: 50, neutral: 34, deesc: 16 },
  { day: "D9", escalatory: 52, neutral: 33, deesc: 15 },
  { day: "D10", escalatory: 49, neutral: 35, deesc: 16 },
  { day: "D11", escalatory: 51, neutral: 34, deesc: 15 },
  { day: "D12", escalatory: 54, neutral: 32, deesc: 14 },
  { day: "D13", escalatory: 52, neutral: 33, deesc: 15 },
  { day: "D14", escalatory: 55, neutral: 31, deesc: 14 },
];

// ── Media chart (full width: headline / sentiment trend) ─────────────────────
function MediaChart() {
  const latest = MEDIA_CHART_DATA[MEDIA_CHART_DATA.length - 1];
  const total = latest.escalatory + latest.neutral + latest.deesc;
  const escPct = total ? Math.round((latest.escalatory / total) * 100) : 0;

  return (
    <div className="col-span-2 rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden flex flex-col min-h-[200px]">
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Media sentiment · headline tone
        </h3>
        <span className="text-xs font-bold text-red-600 tabular-nums">{escPct}% escalatory (14d)</span>
      </div>
      <div className="flex-1 min-h-[140px] p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MEDIA_CHART_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mediaEsc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mediaNeu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64748b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mediaDeesc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 9 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
            <Tooltip
              formatter={(value: number | undefined) => [value != null ? `${value}%` : "", ""]}
              contentStyle={{ fontSize: 11, padding: "6px 8px" }}
              labelFormatter={(label) => `Day ${label.replace("D", "")}`}
            />
            <Area type="monotone" dataKey="escalatory" stroke="#ef4444" fill="url(#mediaEsc)" strokeWidth={1.5} name="Escalatory" stackId="1" />
            <Area type="monotone" dataKey="neutral" stroke="#64748b" fill="url(#mediaNeu)" strokeWidth={1.5} name="Neutral" stackId="1" />
            <Area type="monotone" dataKey="deesc" stroke="#22c55e" fill="url(#mediaDeesc)" strokeWidth={1.5} name="De-escalatory" stackId="1" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Grid: 2 cards side by side, then full-width media ─────────────────────────
export function AnalyticsGrid() {
  const { data, loading } = useDashboardData();
  const riskDist = data.kpis.riskDistribution ?? {
    distribution: {},
    totalCountries: 0,
    recentChanges: [],
  };
  const regionalBreakdown = data.kpis.regionalBreakdown ?? [];

  return (
    <div className="grid grid-cols-2 gap-4 auto-rows-auto">
      <RiskDistributionCard
        distribution={riskDist.distribution}
        totalCountries={riskDist.totalCountries}
        recentChanges={riskDist.recentChanges ?? []}
        loading={loading}
      />
      <RegionalBreakdownCard regions={regionalBreakdown} loading={loading} />
      <MediaChart />
    </div>
  );
}
