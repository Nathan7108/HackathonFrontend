"use client";

import { WATCHLIST_COUNTRIES } from "@/lib/placeholder-data";
import {
  TOP_ESCALATING,
  TOP_DEESCALATING,
  SENTIMENT_TREND_30D,
  REGIONAL_BREAKDOWN,
  RISK_DISTRIBUTION,
  MODEL_PERFORMANCE,
} from "@/lib/dashboard-data";
import { Sparkline } from "@/components/dashboard/Sparkline";

const ACTIVE_COUNTRIES = WATCHLIST_COUNTRIES.filter(
  (c) => c.code !== "P1" && c.code !== "P2"
).sort((a, b) => b.riskScore - a.riskScore);

const ANOMALY_COUNTRIES = ACTIVE_COUNTRIES
  .filter((c) => c.anomaly.detected)
  .sort((a, b) => b.anomaly.score - a.anomaly.score);

const RISK_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  ELEVATED: "#ea580c",
  HIGH: "#ef4444",
  CRITICAL: "#991b1b",
};

const TIER_COLORS: Record<string, string> = {
  CRITICAL: "#991b1b",
  HIGH: "#ef4444",
  ELEVATED: "#ea580c",
  MODERATE: "#eab308",
  LOW: "#22c55e",
};

const SEVERITY_ABBR: Record<string, string> = { HIGH: "HIGH", MED: "ELV", LOW: "MOD" };

const RECENT_EVENTS = [
  { time: "2m", icon: "🔴", text: "Artillery strikes near Zaporizhzhia", country: "UA", type: "BATTLE" },
  { time: "8m", icon: "🔴", text: "IRGC naval exercises, Strait of Hormuz", country: "IR", type: "MILITARY" },
  { time: "14m", icon: "🟠", text: "Opposition rally in Islamabad, 50k", country: "PK", type: "PROTEST" },
  { time: "23m", icon: "🔴", text: "RSF advances on El Fasher", country: "SD", type: "BATTLE" },
  { time: "31m", icon: "🟡", text: "PLA aircraft enter Taiwan ADIZ", country: "TW", type: "MILITARY" },
  { time: "45m", icon: "🟠", text: "Armed clashes in Amhara region", country: "ET", type: "BATTLE" },
  { time: "1h", icon: "🟡", text: "Inflation data release, Caracas", country: "VE", type: "ECONOMIC" },
  { time: "2h", icon: "🟢", text: "Ceasefire talks resume, Jeddah", country: "YE", type: "DIPLOMATIC" },
  { time: "3h", icon: "🟠", text: "Boko Haram attack in Borno state", country: "NG", type: "BATTLE" },
  { time: "4h", icon: "🟢", text: "EU sanctions package announced", country: "EU", type: "DIPLOMATIC" },
  { time: "5h", icon: "🔴", text: "Drone strike on Kherson oblast", country: "UA", type: "BATTLE" },
  { time: "6h", icon: "🟠", text: "Anti-government protest in Yangon", country: "MM", type: "PROTEST" },
  { time: "7h", icon: "🟡", text: "Oil tanker detained near Hormuz", country: "IR", type: "MARITIME" },
  { time: "8h", icon: "🟢", text: "Humanitarian corridor opened, Darfur", country: "SD", type: "HUMANITARIAN" },
];

const sentimentLast7 = SENTIMENT_TREND_30D.slice(-7).map((d) => d.escalatory);
const sentimentLast30 = SENTIMENT_TREND_30D.map((d) => d.escalatory);
const latestSentiment = SENTIMENT_TREND_30D[SENTIMENT_TREND_30D.length - 1];
const total = latestSentiment.escalatory + latestSentiment.neutral + latestSentiment.deescalatory;
const escPct = Math.round((latestSentiment.escalatory / total) * 100);
const neuPct = Math.round((latestSentiment.neutral / total) * 100);
const deescPct = 100 - escPct - neuPct;

const modelAccuracy = MODEL_PERFORMANCE[MODEL_PERFORMANCE.length - 1]?.accuracy ?? 98;
const modelAccuracyTrend = MODEL_PERFORMANCE.map((m) => m.accuracy);

interface Props {
  onCountrySelect: (code: string) => void;
}

export function GlobeBottomPanel({ onCountrySelect }: Props) {
  return (
    <div className="bg-white border-t border-gray-200 px-6 py-8 min-h-[520px] shrink-0">
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
          Intelligence feed
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Scroll for more — activity, anomalies, sentiment, regional risk</p>
      </div>
      <div className="grid grid-cols-12 gap-4">
        {/* ── Col 1: Recent Activity Feed (4 cols) ─────────────────── */}
        <div className="col-span-4 border border-gray-200 rounded-xl overflow-hidden min-h-[380px]">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Recent Activity
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600 bg-green-50 rounded-md px-2 py-1 ml-auto">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
            {RECENT_EVENTS.map((e, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-[13px] border-b border-gray-100 last:border-0">
                <span className="font-mono text-gray-400 w-8 shrink-0 text-right text-xs">{e.time}</span>
                <span className="shrink-0 text-base">{e.icon}</span>
                <span className="text-gray-700 flex-1 truncate">{e.text}</span>
                <span className="text-[11px] font-mono text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 shrink-0">{e.type}</span>
                <span className="font-mono text-gray-400 shrink-0 text-xs">{e.country}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Col 2: Anomalies + Escalation (3 cols) ───────────────── */}
        <div className="col-span-3 flex flex-col gap-4">
          {/* Anomalies */}
          <div className="border border-gray-200 rounded-xl overflow-hidden min-h-[200px] flex-1">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Anomaly Alerts
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse shrink-0" />
              <span className="text-xs text-gray-500 ml-auto">{ANOMALY_COUNTRIES.length} active</span>
            </div>
            <div className="max-h-[220px] overflow-y-auto scrollbar-thin">
              {ANOMALY_COUNTRIES.map((country) => {
                const abbr = SEVERITY_ABBR[country.anomaly.severity] ?? country.anomaly.severity;
                const pillBg = country.anomaly.severity === "HIGH" ? "#fee2e2" : country.anomaly.severity === "MED" ? "#ffedd5" : "#fef9c3";
                const pillColor = country.anomaly.severity === "HIGH" ? "#dc2626" : country.anomaly.severity === "MED" ? "#ea580c" : "#ca8a04";
                return (
                  <div
                    key={country.code}
                    onClick={() => onCountrySelect(country.code)}
                    className="flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-orange-50 transition-colors"
                  >
                    <span className="text-sm text-orange-500 shrink-0">⚠</span>
                    <span className="text-base leading-none shrink-0">{country.flag}</span>
                    <span className="text-[13px] text-gray-700 flex-1 truncate">{country.name}</span>
                    <div className="w-[56px] h-2 bg-gray-100 rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${country.anomaly.score * 100}%`, background: "#f97316" }}
                      />
                    </div>
                    <span className="text-xs font-mono text-gray-500 w-9 text-right shrink-0">
                      {country.anomaly.score.toFixed(2)}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: pillBg, color: pillColor }}
                    >
                      {abbr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Escalation Movers */}
          <div className="border border-gray-200 rounded-xl overflow-hidden min-h-[180px]">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Escalation Movers
              </span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {TOP_ESCALATING.map((m) => (
                <div key={m.country} className="flex items-center gap-2 text-[13px]">
                  <span className="text-red-500 font-medium shrink-0">▲</span>
                  <span className="text-gray-700 flex-1">{m.country}</span>
                  <span className="text-red-500 font-mono font-semibold">+{m.delta}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 my-2" />
              {TOP_DEESCALATING.map((m) => (
                <div key={m.country} className="flex items-center gap-2 text-[13px]">
                  <span className="text-green-500 font-medium shrink-0">▼</span>
                  <span className="text-gray-700 flex-1">{m.country}</span>
                  <span className="text-green-500 font-mono font-semibold">{m.delta}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Col 3: Sentiment + Regional (3 cols) ─────────────────── */}
        <div className="col-span-3 flex flex-col gap-4">
          {/* Global Sentiment */}
          <div className="border border-gray-200 rounded-xl overflow-hidden min-h-[180px]">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Global Sentiment
              </span>
            </div>
            <div className="px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-4 rounded-full overflow-hidden flex">
                  <div className="bg-red-500" style={{ width: `${escPct}%` }} />
                  <div className="bg-gray-300" style={{ width: `${neuPct}%` }} />
                  <div className="bg-green-500" style={{ width: `${deescPct}%` }} />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span className="text-red-500 font-medium">{escPct}% escalatory</span>
                <span>{neuPct}% neutral</span>
                <span className="text-green-500 font-medium">{deescPct}% de-esc.</span>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <span className="text-xs text-gray-500 shrink-0">7d:</span>
                <Sparkline data={sentimentLast7} width={120} height={28} color="#ef4444" />
                <span className="text-xs text-gray-500 shrink-0">30d:</span>
                <Sparkline data={sentimentLast30} width={120} height={28} color="#ef4444" showArea />
                <span className="text-xs text-red-500 font-medium shrink-0">▲ rising</span>
              </div>
            </div>
          </div>

          {/* Regional Breakdown */}
          <div className="border border-gray-200 rounded-xl overflow-hidden flex-1 min-h-[220px]">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Regional Breakdown
              </span>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {REGIONAL_BREAKDOWN.map((r) => {
                const barColor =
                  r.avgRisk >= 65 ? "#ef4444" :
                  r.avgRisk >= 50 ? "#ea580c" :
                  r.avgRisk >= 40 ? "#eab308" : "#22c55e";
                return (
                  <div key={r.region} className="flex items-center gap-2 text-[13px]">
                    <span className="text-gray-600 w-[120px] truncate shrink-0">{r.region}</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${r.avgRisk}%`, background: barColor }} />
                    </div>
                    <span className="font-mono text-gray-600 w-6 text-right shrink-0">{r.avgRisk}</span>
                    {r.anomalies > 0 && (
                      <span className="text-xs text-orange-500 shrink-0">⚠{r.anomalies}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Col 4: Risk Distribution + Model Health (2 cols) ──────── */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Risk Distribution */}
          <div className="border border-gray-200 rounded-xl overflow-hidden min-h-[180px]">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Risk Distribution
              </span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {RISK_DISTRIBUTION.map((r) => (
                <div key={r.tier} className="flex items-center gap-2 text-[13px]">
                  <div
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ background: TIER_COLORS[r.tier] ?? "#94a3b8" }}
                  />
                  <span className="text-gray-500 w-16 shrink-0">{r.tier}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(r.count / 1.2, 100)}%`,
                        background: TIER_COLORS[r.tier] ?? "#94a3b8",
                      }}
                    />
                  </div>
                  <span className="font-mono text-gray-500 w-6 text-right shrink-0">{r.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Model Health */}
          <div className="border border-gray-200 rounded-xl overflow-hidden flex-1 min-h-[200px]">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Model Health
              </span>
            </div>
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-black text-green-600 tabular-nums">{modelAccuracy}%</span>
                <span className="text-sm text-gray-500">accuracy</span>
              </div>
              <Sparkline data={modelAccuracyTrend} width={160} height={32} color="#16a34a" showArea />
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
                <div className="text-gray-500">Version</div>
                <div className="text-gray-700 font-mono text-right">v4.2.1</div>
                <div className="text-gray-500">Features</div>
                <div className="text-gray-700 font-mono text-right">847</div>
                <div className="text-gray-500">Countries</div>
                <div className="text-gray-700 font-mono text-right">201</div>
                <div className="text-gray-500">Sources</div>
                <div className="text-gray-700 font-mono text-right">6</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
