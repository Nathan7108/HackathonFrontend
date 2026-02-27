"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { api } from "@/lib/api";
import type { ForecastResult } from "@/lib/types";

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
  const { data: dashboardData, loading: dashboardLoading } = useDashboardData();
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  const topCountry = dashboardData.countries?.[0] ?? null;

  useEffect(() => {
    if (!topCountry?.name || !topCountry?.code) {
      setForecast(null);
      return;
    }
    let cancelled = false;
    setForecastLoading(true);
    setForecastError(null);
    api
      .getForecast(topCountry.name, topCountry.code)
      .then((res) => {
        if (!cancelled) setForecast(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setForecastError(err instanceof Error ? err.message : "Forecast failed");
          setForecast(null);
        }
      })
      .finally(() => {
        if (!cancelled) setForecastLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [topCountry?.name, topCountry?.code]);

  const chartData = useMemo(() => {
    const current = topCountry?.riskScore ?? 0;
    const f30 = forecast?.forecast_30d ?? current;
    const f60 = forecast?.forecast_60d ?? f30;
    const f90 = forecast?.forecast_90d ?? f60;
    return [
      { day: 0, label: "Today", score: current },
      { day: 30, label: "30d", score: Math.round(f30) },
      { day: 60, label: "60d", score: Math.round(f60) },
      { day: 90, label: "90d", score: Math.round(f90) },
    ];
  }, [topCountry?.riskScore, forecast]);

  const trend = forecast?.trend ?? "STABLE";
  const trendInfo = TREND_BADGE[trend] ?? TREND_BADGE.STABLE;
  const riskColor = topCountry ? (RISK_COLORS[topCountry.riskLevel] ?? "#6b7280") : "#6b7280";

  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-md border border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-300 shrink-0">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Forecast · ML risk trajectory
        </h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin px-3 py-3 flex flex-col">
        {dashboardLoading && !topCountry && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
        )}
        {!dashboardLoading && !topCountry && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No country data</div>
        )}
        {topCountry && (
          <>
            <div
              className="flex items-center gap-3 shrink-0 mb-3"
              style={{ marginLeft: 16 }}
            >
              <span className="text-2xl font-black tabular-nums leading-none" style={{ color: riskColor }}>
                {topCountry.riskScore}
              </span>
              <div className="min-w-0">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: riskColor + "22", color: riskColor }}
                >
                  {topCountry.riskLevel}
                </span>
                <p className="text-sm font-semibold text-gray-800 truncate">{topCountry.name}</p>
              </div>
            </div>

            {forecastLoading && !forecast && (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-8">
                Loading ML forecast…
              </div>
            )}
            {forecastError && !forecast && (
              <div className="text-sm text-amber-600 py-2">{forecastError}</div>
            )}
            {forecast && (
              <>
                <div className="flex-1 min-h-0 w-full overflow-hidden" style={{ minHeight: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
                      <XAxis
                        dataKey="day"
                        tickFormatter={(v) => (v === 0 ? "Today" : `${v}d`)}
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                      />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} width={32} />
                      <Tooltip
                        contentStyle={{ fontSize: 11, padding: "6px 10px", borderRadius: 6 }}
                        formatter={(v: number | undefined) => [v ?? 0, "Risk score"]}
                        labelFormatter={(_, payload) => payload[0]?.payload?.label ?? ""}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke={riskColor}
                        fill={riskColor}
                        fillOpacity={0.2}
                        strokeWidth={2}
                        dot={{ fill: riskColor, strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center gap-4 flex-wrap shrink-0 mt-3 pt-3 border-t border-gray-100">
                  {[
                    { label: "30d", value: Math.round(forecast.forecast_30d) },
                    { label: "60d", value: Math.round(forecast.forecast_60d) },
                    { label: "90d", value: Math.round(forecast.forecast_90d) },
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

                <p className="text-[11px] text-gray-400 shrink-0 mt-2">
                  LSTM forecast from ACLED, GDELT, UCDP. Predicts risk 30 / 60 / 90 days ahead.
                </p>
              </>
            )}

            <Link
              href={`/country/${topCountry.code}`}
              className="inline-block text-sm font-semibold text-blue-600 hover:underline mt-3"
            >
              View full analysis →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
