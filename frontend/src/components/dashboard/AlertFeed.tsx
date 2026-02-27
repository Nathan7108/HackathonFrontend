"use client";

import { useState } from "react";
import { RiSearchLine } from "@remixicon/react";
import { BarList, Card, Dialog, DialogPanel, TextInput } from "@tremor/react";
import { useAlerts } from "@/lib/hooks/useAlerts";
import type { DashboardAlert } from "@/lib/types";

function formatAlertTime(iso: string): string {
  try {
    const d = new Date(iso);
    const h = d.getUTCHours();
    const m = d.getUTCMinutes();
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  } catch {
    return "—";
  }
}

function alertTypeToLabel(type: DashboardAlert["type"]): string {
  if (type === "ANOMALY_DETECTED") return "ANOMALY";
  if (type === "TIER_CHANGE" || type === "SCORE_SPIKE") return "ESCALATION";
  return type;
}

const SEVERITY_WEIGHT: Record<string, number> = {
  HIGH: 4,
  ELEVATED: 3,
  MODERATE: 2,
  LOW: 1,
};

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-green-50">
      <span className="relative flex h-1.5 w-1.5">
        <span className="light-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
      </span>
      <span className="text-[9px] font-bold text-green-600 uppercase">Live</span>
    </span>
  );
}

/** BarList items: name = time + type + detail, value = severity weight. No per-item color (neutral bar like example). */
function alertsToBarList(alerts: DashboardAlert[]) {
  return alerts.map((a, i) => ({
    key: `${a.code}-${a.type}-${i}`,
    name: `${formatAlertTime(a.time)} · ${alertTypeToLabel(a.type)} · ${a.detail}`,
    value: SEVERITY_WEIGHT[a.severity] ?? 2,
  }));
}

const valueFormatter = (value: number) => {
  const labels: Record<number, string> = {
    1: "Low",
    2: "Moderate",
    3: "Elevated",
    4: "High",
  };
  return labels[value] ?? String(value);
};

export function AlertFeed() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, loading, error } = useAlerts();
  const alerts = data?.alerts ?? [];
  const activeCount = alerts.filter(
    (a) => a.severity === "HIGH" || a.severity === "ELEVATED"
  ).length;

  const allItems = alertsToBarList(alerts);
  const filteredItems = searchQuery.trim()
    ? allItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allItems;
  const topItems = allItems.slice(0, 5);

  return (
    <>
      <Card className="relative flex flex-col h-full min-h-0">
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Alert Feed
          </p>
          <LiveBadge />
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-medium tabular-nums">
            {activeCount} active
          </span>
        </div>
        <p
          className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong mt-1"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {alerts.length} alerts
        </p>
        {error && (
          <p className="text-sm text-amber-600 mt-2">Alerts unavailable.</p>
        )}
        {!error && alerts.length > 0 && (
          <>
            <div className="mt-4 flex items-center justify-between shrink-0">
              <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Top 5 alerts
              </p>
              <p className="text-tremor-label font-medium uppercase text-tremor-content dark:text-dark-tremor-content">
                Severity
              </p>
            </div>
            <BarList
              data={topItems}
              valueFormatter={valueFormatter}
              className="bar-list-thin mt-2 flex-1 min-h-0"
            />
          </>
        )}
        {!error && alerts.length === 0 && !loading && (
          <p className="text-tremor-default text-tremor-content mt-2">
            No escalation alerts.
          </p>
        )}
        <div className="relative flex justify-center pt-2 pb-2 mt-auto">
          <button
            type="button"
            className="flex items-center justify-center rounded-tremor-small border border-tremor-border bg-tremor-background px-2.5 py-2 text-tremor-default font-medium text-tremor-content-strong shadow-tremor-input hover:bg-tremor-background-muted dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:text-dark-tremor-content-strong dark:shadow-dark-tremor-input hover:dark:bg-dark-tremor-background-muted"
            onClick={() => setIsOpen(true)}
          >
            Show more
          </button>
        </div>
      </Card>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} static className="z-[100]">
        <DialogPanel className="overflow-hidden p-0 max-w-lg">
          <div className="px-6 pb-4 pt-6">
            <TextInput
              icon={RiSearchLine}
              placeholder="Search alerts..."
              className="rounded-tremor-small"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <div className="flex items-center justify-between pt-4">
              <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Alerts
              </p>
              <p className="text-tremor-label font-medium uppercase text-tremor-content dark:text-dark-tremor-content">
                Severity
              </p>
            </div>
          </div>
          <div className="h-96 overflow-y-auto px-6">
            {filteredItems.length > 0 ? (
              <BarList
                data={filteredItems}
                valueFormatter={valueFormatter}
                className="bar-list-thin"
              />
            ) : (
              <p className="flex h-full items-center justify-center text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong">
                No results.
              </p>
            )}
          </div>
          <div className="mt-4 border-t border-tremor-border bg-tremor-background-muted p-6 dark:border-dark-tremor-border dark:bg-dark-tremor-background">
            <button
              type="button"
              className="flex w-full items-center justify-center rounded-tremor-small border border-tremor-border bg-tremor-background py-2 text-tremor-default font-medium text-tremor-content-strong shadow-tremor-input hover:bg-tremor-background-muted dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:text-dark-tremor-content-strong dark:shadow-dark-tremor-input hover:dark:bg-dark-tremor-background-muted"
              onClick={() => setIsOpen(false)}
            >
              Go back
            </button>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
