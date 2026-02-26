"use client";

import { WATCHLIST_COUNTRIES } from "@/lib/placeholder-data";
import { TOP_ESCALATING, TOP_DEESCALATING } from "@/lib/dashboard-data";

const RISK_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  ELEVATED: "#ea580c",
  HIGH: "#ef4444",
  CRITICAL: "#991b1b",
};

const LAYER_CONFIG = [
  { key: "conflictZones", label: "Conflict Zones", color: "bg-red-500", count: 37 },
  { key: "anomalyAlerts", label: "Anomaly Alerts", color: "bg-orange-500", count: 5 },
  { key: "facilities", label: "Facilities", color: "bg-blue-500", count: 5 },
  { key: "tradeRoutes", label: "Trade Routes", color: "bg-indigo-400", count: 3 },
  { key: "infrastructure", label: "Infrastructure", color: "bg-gray-400", count: 0 },
] as const;

type LayerKey = (typeof LAYER_CONFIG)[number]["key"];

export interface GlobeLayerState {
  conflictZones: boolean;
  anomalyAlerts: boolean;
  facilities: boolean;
  tradeRoutes: boolean;
  infrastructure: boolean;
}

interface Props {
  selectedCode: string | null;
  onCountrySelect: (code: string) => void;
  layers: GlobeLayerState;
  onLayersChange: (layers: GlobeLayerState) => void;
}

const ACTIVE_COUNTRIES = WATCHLIST_COUNTRIES.filter(
  (c) => c.code !== "P1" && c.code !== "P2"
).sort((a, b) => b.riskScore - a.riskScore);

const DELTAS: Record<string, number> = {
  UA: 3, IR: 2, TW: 1, ET: -2, PK: 4, VE: 3, RS: -1, BR: 0,
};

const DATA_SOURCES = [
  { name: "GDELT", time: "2m" },
  { name: "ACLED", time: "3d" },
  { name: "UCDP", time: "7d" },
  { name: "W.Bank", time: "30d" },
  { name: "NewsAPI", time: "5m" },
  { name: "OCHA", time: "1d" },
];

export function GlobeLeftPanel({
  selectedCode,
  onCountrySelect,
  layers,
  onLayersChange,
}: Props) {
  const toggleLayer = (key: LayerKey) =>
    onLayersChange({ ...layers, [key]: !layers[key] });

  return (
    <div className="w-[236px] h-full flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* ── Section 1: Watchlist (top) ─────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin border-b border-gray-100">
        <div className="px-8 pt-4.5 pb-3.5 shrink-0">
          <h3 className="text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
            Watchlist
          </h3>
          <span className="text-[12px] text-slate-600 mt-1 block font-medium">{ACTIVE_COUNTRIES.length} countries</span>
        </div>

        <div className="px-8 py-2">
          {ACTIVE_COUNTRIES.map((country) => {
            const color = RISK_COLORS[country.riskLevel];
            const isSelected = selectedCode === country.code;
            const delta = DELTAS[country.code] ?? 0;

            return (
              <div
                key={country.code}
                onClick={() => onCountrySelect(country.code)}
                className="flex items-center gap-1.5 px-4 py-2 cursor-pointer transition-colors border-l-2 rounded-md overflow-hidden"
                style={{
                  borderLeftColor: isSelected ? "#2563eb" : "transparent",
                  background: isSelected ? "#eff6ff" : undefined,
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = ""; }}
              >
                <span className="text-sm leading-none shrink-0">{country.flag}</span>
                <span
                  className="text-[13px] flex-1 truncate"
                  style={{ color: "#374151", fontWeight: isSelected ? 600 : 400, maxWidth: 72 }}
                >
                  {country.name}
                </span>
                <span
                  className="text-[12px] font-mono font-bold shrink-0 tabular-nums w-5 text-right"
                  style={{ color }}
                >
                  {country.riskScore}
                </span>
                <span
                  className="text-[11px] font-mono shrink-0 w-4 text-right"
                  style={{ color: delta > 0 ? "#dc2626" : delta < 0 ? "#16a34a" : "#9ca3af" }}
                >
                  {delta > 0 ? `▲${delta}` : delta < 0 ? `▼${Math.abs(delta)}` : "▽0"}
                </span>
                <div className="w-[34px] h-2 bg-gray-100 rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${country.riskScore}%`, background: color }}
                  />
                </div>
                {country.anomaly.detected && (
                  <span className="text-xs text-orange-500 shrink-0">⚠</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-8 py-4 border-t border-gray-100 mt-1">
          <p className="text-[13px] font-semibold text-slate-800 tracking-[0.01em] mb-1.5">Movers</p>
          <div className="text-[12px] leading-5">
            {TOP_ESCALATING.slice(0, 3).map((m, i) => (
              <span key={m.country}>
                {i > 0 && <span className="text-gray-300 mx-0.5">·</span>}
                <span className="text-red-500 font-medium">▲ {m.country} +{m.delta}</span>
              </span>
            ))}
          </div>
          <div className="text-[12px] leading-5">
            {TOP_DEESCALATING.slice(0, 3).map((m, i) => (
              <span key={m.country}>
                {i > 0 && <span className="text-gray-300 mx-0.5">·</span>}
                <span className="text-green-500 font-medium">▼ {m.country} {m.delta}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 2: Layers ─────────────────────────────────────── */}
      <div className="shrink-0 px-8 pt-4.5 pb-4 border-b border-gray-100">
        <h3 className="text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
          Map layers
        </h3>
        <div className="mt-2 space-y-1.5">
          {LAYER_CONFIG.map(({ key, label, color, count }) => (
            <label
              key={key}
              className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 px-3 rounded-md"
            >
              <input
                type="checkbox"
                checked={layers[key]}
                onChange={() => toggleLayer(key)}
                className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                style={{ accentColor: "#2563eb" }}
              />
              <span className={`h-2 w-2 rounded-full shrink-0 ${color}`} />
              <span className="text-sm text-gray-700 flex-1">{label}</span>
              <span className="text-xs font-mono text-gray-500">{count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Section 3: Data sources (footer) ───────────────────────── */}
      <div className="shrink-0 px-8 py-4 bg-gray-50">
        <h3 className="text-[13px] font-semibold text-slate-800 tracking-[0.01em] mb-1.5">
          Sources
        </h3>
        <div className="grid grid-cols-3 gap-x-2 gap-y-1.5">
          {DATA_SOURCES.map((s) => (
            <div key={s.name} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-[12px] text-gray-600 truncate">{s.name}</span>
              <span className="text-[11px] font-mono text-gray-500 ml-auto">{s.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
