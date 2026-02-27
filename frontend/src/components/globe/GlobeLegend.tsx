"use client";

const LEGEND_ITEMS = [
  { level: "CRITICAL", color: "bg-red-500", pulse: true },
  { level: "HIGH", color: "bg-orange-500", pulse: true },
  { level: "ELEVATED", color: "bg-amber-500", pulse: false },
  { level: "MODERATE", color: "bg-yellow-500", pulse: false },
  { level: "LOW", color: "bg-emerald-500", pulse: false },
];

const LAYER_ITEMS = [
  { label: "Events", type: "dot", color: "#dc2626" },
  { label: "Facilities", type: "dot", color: "#2563eb" },
  { label: "Trade Routes", type: "line", color: "#6366f1" },
];

export function GlobeLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 rounded-lg px-4 py-3 flex items-center gap-4">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.level} className="flex items-center gap-1.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${item.color} ${item.pulse ? "animate-pulse" : ""}`}
          />
          <span className="text-xs text-zinc-400 font-medium">{item.level}</span>
        </div>
      ))}
      <div className="h-4 w-px bg-zinc-700/50" />
      {LAYER_ITEMS.map((l) => (
        <div key={l.label} className="flex items-center gap-1.5">
          {l.type === "dot" ? (
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
          ) : (
            <svg width={12} height={4} className="shrink-0">
              <line
                x1={0}
                y1={2}
                x2={12}
                y2={2}
                stroke={l.color}
                strokeWidth={1.5}
                strokeDasharray="3 2"
              />
            </svg>
          )}
          <span className="text-xs text-zinc-500">{l.label}</span>
        </div>
      ))}
    </div>
  );
}
