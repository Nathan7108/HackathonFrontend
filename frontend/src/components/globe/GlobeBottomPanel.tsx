"use client";

import { useEffect, useState } from "react";
import { WATCHLIST_COUNTRIES } from "@/lib/placeholder-data";
import {
  TOP_ESCALATING,
  TOP_DEESCALATING,
  SENTIMENT_TREND_30D,
  MODEL_PERFORMANCE,
} from "@/lib/dashboard-data";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { api } from "@/lib/api";
import type { RecentActivityItem } from "@/lib/types";

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

const RISK_TIER_ORDER = ["CRITICAL", "HIGH", "ELEVATED", "MODERATE", "LOW"] as const;

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  ALL: "All",
  MILITARY: "Military",
  ECONOMIC: "Economic",
  DIPLOMATIC: "Diplomatic",
  HUMANITARIAN: "Humanitarian",
  PROTEST: "Protest",
  BATTLE: "Battle",
  NEWS: "News",
};

export function GlobeBottomPanel({ onCountrySelect }: Props) {
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("ALL");
  const [activitySortBy, setActivitySortBy] = useState<"newest" | "type">("newest");
  const { data: dashboardData, loading: kpisLoading } = useDashboardData();
  const riskDistribution = dashboardData.kpis.riskDistribution ?? { distribution: {}, totalCountries: 0, recentChanges: [] };
  const regionalBreakdown = dashboardData.kpis.regionalBreakdown ?? [];

  useEffect(() => {
    let cancelled = false;
    setActivityLoading(true);
    setActivityError(null);
    api
      .getRecentActivity()
      .then((res) => {
        if (cancelled) return;
        setRecentActivity(res.items);
        if (res.error === "apiKeyInvalid") {
          setActivityError("NewsAPI key invalid. Get a free key at newsapi.org and set NEWS_API in .env");
        } else if (res.error === "noApiKey") {
          setActivityError("Set NEWS_API in backend .env (get a free key at newsapi.org)");
        } else if (res.error) {
          setActivityError("Could not load activity. Check backend logs.");
        }
      })
      .catch((err) => {
        if (!cancelled) setActivityError(err instanceof Error ? err.message : "Failed to load activity");
      })
      .finally(() => {
        if (!cancelled) setActivityLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const typeOrder = ["ALL", "MILITARY", "ECONOMIC", "DIPLOMATIC", "HUMANITARIAN", "PROTEST", "BATTLE", "NEWS"];
  const seenTypes = new Set(recentActivity.map((e) => e.type).filter(Boolean));
  const activityTypes = typeOrder.filter((t) => t === "ALL" || seenTypes.has(t));

  const filteredActivity = activityTypeFilter === "ALL"
    ? recentActivity
    : recentActivity.filter((e) => e.type === activityTypeFilter);
  const sortedActivity =
    activitySortBy === "type"
      ? [...filteredActivity].sort((a, b) => a.type.localeCompare(b.type))
      : filteredActivity;

  return (
    <div className="bg-white px-6 py-8 min-h-[520px] shrink-0">
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
          Intelligence feed
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Scroll for more — activity, anomalies, sentiment, regional risk</p>
      </div>
      <div className="grid grid-cols-12 gap-4">
        {/* ── Col 1: Recent Activity Feed (4 cols) ─────────────────── */}
        <div className="col-span-4 border border-slate-300 rounded-xl overflow-hidden min-h-[420px] flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-slate-300 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Recent Activity
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600 bg-green-50 rounded-md px-2 py-1 ml-auto">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              LIVE
            </span>
          </div>
          {/* Filter by type + Sort */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-gray-50/80 border-b border-slate-200 shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {activityTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActivityTypeFilter(type)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    activityTypeFilter === type
                      ? "bg-slate-700 text-white"
                      : "bg-white border border-slate-300 text-gray-600 hover:bg-slate-100"
                  }`}
                >
                  {ACTIVITY_TYPE_LABELS[type] ?? type}
                </button>
              ))}
            </div>
            <select
              value={activitySortBy}
              onChange={(ev) => setActivitySortBy(ev.target.value as "newest" | "type")}
              className="ml-auto text-xs font-medium text-gray-600 bg-white border border-slate-300 rounded-md px-2 py-1 cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="type">Sort by category</option>
            </select>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
            {activityLoading && (
              <div className="px-4 py-8 text-center text-sm text-gray-500">Loading recent activity…</div>
            )}
            {activityError && (
              <div className="px-4 py-6 text-center text-sm text-amber-600">
                {activityError}
              </div>
            )}
            {!activityLoading && !activityError && recentActivity.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500">No recent activity</div>
            )}
            {!activityLoading && !activityError && sortedActivity.length === 0 && recentActivity.length > 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500">No items in this category</div>
            )}
            {!activityLoading && !activityError && sortedActivity.map((e, i) => (
              <div
                key={i}
                className="px-4 py-3 hover:bg-gray-50 border-b border-slate-200 last:border-0 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="font-mono text-gray-400 w-9 shrink-0 text-right text-xs pt-0.5">{e.time}</span>
                  <span className="shrink-0 text-base pt-0.5">{e.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm leading-snug line-clamp-3">{e.text}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[11px] font-medium text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 shrink-0">
                        {e.type}
                      </span>
                      {e.country !== "—" && (
                        <span className="font-mono text-gray-400 text-xs">{e.country}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Col 2: Anomalies + Escalation (3 cols) ───────────────── */}
        <div className="col-span-3 flex flex-col gap-4">
          {/* Anomalies */}
          <div className="border border-slate-300 rounded-xl overflow-hidden min-h-[200px] flex-1">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-slate-300">
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
          <div className="border border-slate-300 rounded-xl overflow-hidden min-h-[180px]">
            <div className="px-4 py-3 bg-gray-50 border-b border-slate-300">
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
              <div className="border-t border-slate-300 my-2" />
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
          <div className="border border-slate-300 rounded-xl overflow-hidden min-h-[180px]">
            <div className="px-4 py-3 bg-gray-50 border-b border-slate-300">
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
          <div className="border border-slate-300 rounded-xl overflow-hidden flex-1 min-h-[220px]">
            <div className="px-4 py-3 bg-gray-50 border-b border-slate-300">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Regional Breakdown
              </span>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {kpisLoading && (
                <div className="py-4 text-center text-sm text-gray-500">Loading…</div>
              )}
              {!kpisLoading && regionalBreakdown.length === 0 && (
                <div className="py-4 text-center text-sm text-gray-500">No regional data</div>
              )}
              {!kpisLoading && regionalBreakdown.map((r) => {
                const barColor =
                  r.avgRisk >= 65 ? "#ef4444" :
                  r.avgRisk >= 50 ? "#ea580c" :
                  r.avgRisk >= 40 ? "#eab308" : "#22c55e";
                const label = REGION_ABBR[r.region] ?? r.region;
                return (
                  <div key={r.region} className="flex items-center gap-2 text-[13px]">
                    <span className="text-gray-600 w-[120px] truncate shrink-0">{label}</span>
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
          <div className="border border-slate-300 rounded-xl overflow-hidden min-h-[180px]">
            <div className="px-4 py-3 bg-gray-50 border-b border-slate-300">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Risk Distribution
              </span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {kpisLoading && (
                <div className="py-4 text-center text-sm text-gray-500">Loading…</div>
              )}
              {!kpisLoading && riskDistribution.totalCountries === 0 && (
                <div className="py-4 text-center text-sm text-gray-500">No data</div>
              )}
              {!kpisLoading && riskDistribution.totalCountries > 0 && RISK_TIER_ORDER.map((tier) => {
                const count = riskDistribution.distribution[tier] ?? 0;
                const maxCount = Math.max(...RISK_TIER_ORDER.map((t) => riskDistribution.distribution[t] ?? 0), 1);
                const barPct = Math.min((count / maxCount) * 100, 100);
                return (
                  <div key={tier} className="flex items-center gap-2 text-[13px]">
                    <div
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ background: TIER_COLORS[tier] ?? "#94a3b8" }}
                    />
                    <span className="text-gray-500 w-16 shrink-0">{tier}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${barPct}%`,
                          background: TIER_COLORS[tier] ?? "#94a3b8",
                        }}
                      />
                    </div>
                    <span className="font-mono text-gray-500 w-6 text-right shrink-0">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Health */}
          <div className="border border-slate-300 rounded-xl overflow-hidden flex-1 min-h-[200px]">
            <div className="px-4 py-3 bg-gray-50 border-b border-slate-300">
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
