"use client";

import { useState, useEffect } from "react";
import { Card, SparkAreaChart } from "@tremor/react";
import { api } from "@/lib/api";
import type { DashboardKpis, DashboardKpiHistory } from "@/lib/types";

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function getChartSeries(
  history: DashboardKpiHistory | null,
  key: keyof DashboardKpiHistory
): number[] {
  const series = history?.[key];
  if (series?.values?.length) return series.values;
  return [];
}

/** Build spark chart data: array of { date, [categoryName]: value } */
function buildChartData(
  values: number[],
  categoryName: string
): Record<string, string | number>[] {
  if (!values.length) return [];
  return values.map((v, i) => ({ date: `D${i + 1}`, [categoryName]: v }));
}

const KPI_COLORS = [
  { tremor: "orange" as const, positive: "emerald", negative: "red" },
  { tremor: "red" as const, positive: "emerald", negative: "red" },
  { tremor: "amber" as const, positive: "emerald", negative: "red" },
  { tremor: "violet" as const, positive: "emerald", negative: "red" },
  { tremor: "emerald" as const, positive: "emerald", negative: "red" },
];

export interface KpiStripProps {
  data: DashboardKpis;
  loading: boolean;
}

export function KpiStrip({ data, loading }: KpiStripProps) {
  const [history, setHistory] = useState<DashboardKpiHistory | null>(null);
  useEffect(() => {
    api.getDashboardKpiHistory().then(setHistory).catch(() => setHistory(null));
  }, []);

  const dist = data.riskDistribution?.distribution ?? {};
  const highPlusCount =
    (dist["CRITICAL"] ?? 0) + (dist["HIGH"] ?? 0) ||
    (data.riskDistribution?.totalCountries ?? 0);
  const sourcesTotal = data.sourcesActive?.total ?? 6;
  const sourcesActive = data.sourcesActive?.active ?? sourcesTotal;
  const sourcesValue = `${sourcesActive}/${sourcesTotal}`;

  const globalScore = data.globalThreatIndex?.score ?? 0;
  const globalDelta = data.globalThreatIndex?.delta24h ?? 0;
  const globalTrend = data.globalThreatIndex?.trend ?? "STABLE";

  const summary = [
    {
      name: "Global Threat Index",
      value: String(globalScore),
      change: globalDelta >= 0 ? `+${globalDelta}` : String(globalDelta),
      percentageChange:
        globalScore > 0
          ? `${globalDelta >= 0 ? "+" : ""}${((globalDelta / globalScore) * 100).toFixed(1)}%`
          : "—",
      changeType: globalTrend === "ESCALATING" ? "negative" : globalTrend === "DE-ESCALATING" ? "positive" : "neutral",
      chartKey: "globalThreatIndex" as const,
    },
    {
      name: "Active Anomalies",
      value: String(data.activeAnomalies?.total ?? 0),
      change: "—",
      percentageChange: "—",
      changeType: "neutral" as const,
      chartKey: "activeAnomalies" as const,
    },
    {
      name: "High+ Countries",
      value: String(highPlusCount),
      change: "—",
      percentageChange: "—",
      changeType: "neutral" as const,
      chartKey: "highPlusCountries" as const,
    },
    {
      name: "Escalation Alerts",
      value: String(data.escalationAlerts?.count ?? 0),
      change: "—",
      percentageChange: "—",
      changeType: "neutral" as const,
      chartKey: "escalationAlerts" as const,
    },
    {
      name: "Sources Active",
      value: sourcesValue,
      change: "—",
      percentageChange: "—",
      changeType: "positive" as const,
      chartKey: "sourcesActive" as const,
    },
  ];

  return (
    <dl
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 p-4"
      style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.3s" }}
    >
      {summary.map((item, idx) => {
        const colors = KPI_COLORS[idx];
        const chartValues = getChartSeries(history, item.chartKey);
        const chartData = buildChartData(chartValues, item.name);
        const sparkColor =
          item.changeType === "positive"
            ? [colors.positive]
            : item.changeType === "negative"
              ? [colors.negative]
              : [colors.tremor];
        return (
          <Card key={item.name} className="min-h-[140px]">
            <dt className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
              {item.name}
            </dt>
            <div className="mt-1 flex items-baseline justify-between">
              <dd
                className={classNames(
                  item.changeType === "positive" &&
                    "text-emerald-700 dark:text-emerald-500",
                  item.changeType === "negative" &&
                    "text-red-700 dark:text-red-500",
                  "text-tremor-title font-semibold tabular-nums"
                )}
              >
                {item.value}
              </dd>
              {(item.change !== "—" || item.percentageChange !== "—") && (
                <dd className="flex items-center space-x-1 text-tremor-default">
                  <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    {item.change}
                  </span>
                  <span
                    className={classNames(
                      item.changeType === "positive" &&
                        "text-emerald-700 dark:text-emerald-500",
                      item.changeType === "negative" &&
                        "text-red-700 dark:text-red-500"
                    )}
                  >
                    ({item.percentageChange})
                  </span>
                </dd>
              )}
            </div>
            {chartData.length >= 2 && (
              <SparkAreaChart
                data={chartData}
                index="date"
                categories={[item.name]}
                showGradient={false}
                colors={sparkColor}
                className="mt-4 h-10 w-full"
              />
            )}
          </Card>
        );
      })}
    </dl>
  );
}
