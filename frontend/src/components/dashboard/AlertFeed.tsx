"use client";

const MOCK_ALERTS = [
  { time: "14:32", severity: "HIGH" as const,     type: "ANOMALY",    text: "Ukraine anomaly score exceeded 0.85 — HIGH severity",    country: "UA" },
  { time: "13:15", severity: "HIGH" as const,     type: "ESCALATION", text: "Iran risk score crossed HIGH threshold (79)",             country: "IR" },
  { time: "12:48", severity: "ELEVATED" as const, type: "THRESHOLD",  text: "Pakistan protest count 3σ above 90-day baseline",        country: "PK" },
  { time: "11:22", severity: "ELEVATED" as const, type: "ANOMALY",    text: "Ethiopia GDELT tone shifted −2.1 in 24h window",         country: "ET" },
  { time: "09:05", severity: "MODERATE" as const, type: "FORECAST",   text: "Taiwan 90d forecast crossed ELEVATED threshold",         country: "TW" },
  { time: "08:30", severity: "HIGH" as const,     type: "ESCALATION", text: "Sudan fatality rate exceeded critical threshold",        country: "SD" },
  { time: "06:12", severity: "MODERATE" as const, type: "THRESHOLD",  text: "Venezuela inflation indicator spiked +12% MoM",          country: "VE" },
  { time: "02:45", severity: "LOW" as const,      type: "FORECAST",   text: "Brazil risk trajectory stable at LOW level",             country: "BR" },
];

const SEV: Record<string, { bar: string; bg: string; text: string; badge: string }> = {
  HIGH:     { bar: "#dc2626", bg: "#fff5f5", text: "#dc2626", badge: "#fecaca" },
  ELEVATED: { bar: "#ea580c", bg: "#fff7ed", text: "#ea580c", badge: "#fed7aa" },
  MODERATE: { bar: "#ca8a04", bg: "#fefce8", text: "#ca8a04", badge: "#fef08a" },
  LOW:      { bar: "#22c55e", bg: "#f0fdf4", text: "#22c55e", badge: "#bbf7d0" },
};

const TYPE_COLOR: Record<string, string> = {
  ANOMALY:    "#dc2626",
  ESCALATION: "#ea580c",
  THRESHOLD:  "#ca8a04",
  FORECAST:   "#2563eb",
};

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-green-50">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
      </span>
      <span className="text-[9px] font-bold text-green-600 uppercase">Live</span>
    </span>
  );
}

export function AlertFeed() {
  const activeCount = MOCK_ALERTS.filter((a) => a.severity === "HIGH" || a.severity === "ELEVATED").length;

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Alert Feed</span>
          <LiveBadge />
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-medium tabular-nums">
            {activeCount} active
          </span>
        </div>
      </div>

      {/* Alerts — full-row color per severity */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
        {MOCK_ALERTS.map((alert, i) => {
          const s = SEV[alert.severity];
          const typeColor = TYPE_COLOR[alert.type];

          return (
            <div
              key={i}
              className="flex items-stretch border-b border-white/60"
              style={{ background: s.bg, minHeight: 36 }}
            >
              {/* Left severity bar */}
              <div className="w-1 shrink-0" style={{ background: s.bar }} />

              {/* Content */}
              <div className="flex items-center gap-2 px-2 flex-1 min-w-0 py-1">
                {/* Time */}
                <span
                  className="text-[10px] font-mono shrink-0 tabular-nums"
                  style={{ color: s.text, width: 32 }}
                >
                  {alert.time}
                </span>

                {/* Type pill */}
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: s.badge, color: typeColor }}
                >
                  {alert.type}
                </span>

                {/* Text */}
                <span
                  className="text-[11px] font-medium flex-1 truncate"
                  style={{ color: "#374151" }}
                >
                  {alert.text}
                </span>

                {/* Country */}
                <span
                  className="text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded"
                  style={{ background: s.badge, color: s.text }}
                >
                  {alert.country}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
