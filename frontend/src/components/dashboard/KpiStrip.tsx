"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { KPI_SPARKLINE_DATA } from "@/lib/dashboard-data";
import type { DashboardSummary } from "@/lib/types";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  sparkData?: number[];
  accentColor: string;
  bgColor: string;
  textColor: string;
  sourceDots?: boolean;
}

function KpiCard({
  label,
  value,
  delta,
  deltaUp,
  sparkData,
  accentColor,
  bgColor,
  textColor,
  sourceDots = false,
}: KpiCardProps) {
  const chartData = sparkData?.map((v, i) => ({ i, v })) ?? [];

  return (
    <div
      style={{
        background: bgColor,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 6,
        overflow: "hidden",
        position: "relative",
        height: 92,
        boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
      }}
    >
      {/* Label + value — top section */}
      <div style={{ padding: "7px 10px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "#6b7280",
              fontWeight: 700,
            }}
          >
            {label}
          </span>
          {delta && (
            <span style={{ fontSize: 10, fontWeight: 700, color: deltaUp ? "#ef4444" : "#22c55e" }}>
              {deltaUp ? "▲" : "▼"}{delta}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: textColor,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1.1,
            display: "block",
            marginTop: 2,
          }}
        >
          {value}
        </span>
      </div>

      {/* Area chart — fills the bottom half, edge to edge, no padding */}
      {!sourceDots && chartData.length > 0 && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 46 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Area
                type="monotone"
                dataKey="v"
                stroke={accentColor}
                fill={accentColor}
                fillOpacity={0.2}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Source dots — for "6/6 Active" card */}
      {sourceDots && (
        <div style={{ position: "absolute", bottom: 10, left: 10 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: "#22c55e" }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: "#22c55e" }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface KpiStripProps {
  data: DashboardSummary;
  loading: boolean;
}

export function KpiStrip({ data, loading }: KpiStripProps) {
  const gtiDelta = data.globalThreatIndexDelta;
  const hpDelta = data.highPlusCountriesDelta;

  return (
    <div className="grid grid-cols-6 gap-3" style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.3s" }}>
      <KpiCard
        label="Global Threat Index"
        value={data.globalThreatIndex}
        delta={gtiDelta !== 0 ? `${gtiDelta > 0 ? "+" : ""}${gtiDelta}` : undefined}
        deltaUp={gtiDelta > 0}
        sparkData={KPI_SPARKLINE_DATA[0]}
        accentColor="#f59e0b"
        bgColor="#fffbeb"
        textColor="#d97706"
      />
      <KpiCard
        label="Active Anomalies"
        value={data.activeAnomalies}
        sparkData={KPI_SPARKLINE_DATA[1]}
        accentColor="#ef4444"
        bgColor="#fef2f2"
        textColor="#dc2626"
      />
      <KpiCard
        label="HIGH+ Countries"
        value={data.highPlusCountries}
        delta={hpDelta !== 0 ? `${hpDelta > 0 ? "+" : ""}${hpDelta}` : undefined}
        deltaUp={hpDelta > 0}
        sparkData={KPI_SPARKLINE_DATA[2]}
        accentColor="#ef4444"
        bgColor="#fef2f2"
        textColor="#dc2626"
      />
      <KpiCard
        label="Escalation Alerts 24h"
        value={data.escalationAlerts24h}
        sparkData={KPI_SPARKLINE_DATA[3]}
        accentColor="#f97316"
        bgColor="#fff7ed"
        textColor="#ea580c"
      />
      <KpiCard
        label="Model Accuracy"
        value="98%"
        sparkData={KPI_SPARKLINE_DATA[4]}
        accentColor="#22c55e"
        bgColor="#f0fdf4"
        textColor="#16a34a"
      />
      <KpiCard
        label="Sources Active"
        value="6/6"
        sourceDots
        accentColor="#3b82f6"
        bgColor="#eff6ff"
        textColor="#2563eb"
      />
    </div>
  );
}
