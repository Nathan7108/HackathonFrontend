"use client";

import { StatusBar } from "@/components/dashboard/StatusBar";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { WatchlistTable } from "@/components/dashboard/WatchlistTable";
import { ThreatMap } from "@/components/dashboard/ThreatMap";
import { IntelPanel } from "@/components/dashboard/IntelPanel";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { AnalyticsGrid } from "@/components/dashboard/AnalyticsGrid";
import { useDashboardData } from "@/lib/hooks/useDashboardData";

function SubScoresCard() {
  const bars = [
    { label: "Conflict Intensity", value: 68, delta: 4, color: "#b91c1c", desc: "Armed events, fatalities" },
    { label: "Social Unrest", value: 52, delta: -2, color: "#c2410c", desc: "Protests, civil tension" },
    { label: "Economic Stress", value: 47, delta: 1, color: "#a16207", desc: "Inflation, sentiment" },
  ];

  const drivers = [
    { id: "acled_battle_count", weight: "High" },
    { id: "acled_fatalities", weight: "High" },
    { id: "gdelt_goldstein", weight: "Med" },
    { id: "ucdp_deaths", weight: "High" },
    { id: "wb_inflation", weight: "Med" },
    { id: "finbert_negative", weight: "Med" },
    { id: "acled_protest_count", weight: "High" },
  ];

  return (
    <div className="bg-white rounded-md border border-slate-200/80 p-4 flex flex-col gap-4 h-full min-h-0 overflow-hidden">
      <p className="text-xs uppercase tracking-[0.06em] text-slate-500 font-medium shrink-0">
        Aggregate Sub-Scores
      </p>

      <div className="space-y-4 flex-1 min-h-0">
        {bars.map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-slate-700">{s.label}</span>
              <div className="flex items-center gap-2 shrink-0">
                {s.delta !== 0 && (
                  <span className={`text-xs font-medium tabular-nums ${s.delta > 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {s.delta > 0 ? "+" : ""}{s.delta}
                  </span>
                )}
                <span className="text-base font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">{s.desc}</p>
            <div className="w-full h-2.5 rounded-sm bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-sm transition-all"
                style={{ width: `${s.value}%`, backgroundColor: s.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-slate-100 pt-3">
        <p className="text-xs uppercase tracking-[0.06em] text-slate-500 font-medium mb-2">
          Top Risk Drivers
        </p>
        <div className="flex flex-wrap gap-2">
          {drivers.map((d) => (
            <span
              key={d.id}
              className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-medium"
            >
              {d.id}
              <span className="text-[10px] text-slate-400 font-normal ml-1">({d.weight})</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading } = useDashboardData();

  return (
    <div className="flex flex-col min-h-full min-w-0 gap-3">
      <StatusBar />

      <div className="flex flex-col gap-3 flex-1 min-h-0 py-3" style={{ paddingLeft: 12, paddingRight: 12 }}>
        <div>
          <KpiStrip data={data} loading={loading} />
        </div>

        <div className="grid grid-cols-2 gap-3" style={{ height: 400 }}>
          <WatchlistTable countries={data.countries} />
          <ThreatMap />
        </div>

        <div className="grid grid-cols-2 gap-3" style={{ height: 360 }}>
          <SubScoresCard />
          <IntelPanel />
        </div>

        <div className="grid grid-cols-2 gap-3" style={{ minHeight: 240 }}>
          <AlertFeed />
          <AnalyticsGrid />
        </div>
      </div>
    </div>
  );
}
