"use client";

const LEVELS = [
  { label: "Low", color: "#22c55e" },
  { label: "Moderate", color: "#eab308" },
  { label: "Elevated", color: "#f97316" },
  { label: "High", color: "#ef4444" },
  { label: "Critical", color: "#991b1b" },
];

const LAYER_ITEMS = [
  { label: "Events", type: "dot", color: "#dc2626" },
  { label: "Facilities", type: "dot", color: "#2563eb" },
  { label: "Trade Routes", type: "line", color: "#6366f1" },
];

export function GlobeLegend() {
  return (
    <div
      className="absolute bottom-3 left-3 z-10 rounded-md shadow-sm border px-2.5 py-2"
      style={{
        background: "rgba(255,255,255,0.92)",
        borderColor: "#e5e7eb",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
        Risk Level
      </div>
      <div className="flex gap-2.5">
        {LEVELS.map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
            <span className="text-[10px] font-medium text-gray-700">{l.label}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 mt-1.5 pt-1.5 flex gap-3">
        {LAYER_ITEMS.map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            {l.type === "dot" ? (
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            ) : (
              <svg width={12} height={4} className="shrink-0">
                <line
                  x1={0} y1={2} x2={12} y2={2}
                  stroke={l.color} strokeWidth={1.5} strokeDasharray="3 2"
                />
              </svg>
            )}
            <span className="text-[9px] text-gray-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
