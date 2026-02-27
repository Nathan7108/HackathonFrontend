"use client";

import { WATCHLIST_COUNTRIES } from "@/lib/placeholder-data";
import { TOP_ESCALATING, TOP_DEESCALATING } from "@/lib/dashboard-data";

const RISK_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#ca8a04",
  ELEVATED: "#ea580c",
  HIGH: "#dc2626",
  CRITICAL: "#b91c1c",
};

const BADGE_BG: Record<string, string> = {
  LOW: "#dcfce7",
  MODERATE: "#fef9c3",
  ELEVATED: "#ffedd5",
  HIGH: "#fee2e2",
  CRITICAL: "#fecaca",
};

const LAYER_CONFIG = [
  { key: "conflictZones" as const, label: "Conflict Zones", status: "green" as const, count: 37 },
  { key: "anomalyAlerts" as const, label: "Anomaly Alerts", status: "orange" as const, count: 5 },
  { key: "facilities" as const, label: "Facilities", status: "green" as const, count: 5 },
  { key: "tradeRoutes" as const, label: "Trade Routes", status: "orange" as const, count: 3 },
  { key: "infrastructure" as const, label: "Infrastructure", status: "green" as const, count: 0 },
];

export type GlobeLayerState = {
  conflictZones: boolean;
  anomalyAlerts: boolean;
  facilities: boolean;
  tradeRoutes: boolean;
  infrastructure: boolean;
};

type LayerKey = keyof GlobeLayerState;

interface Props {
  selectedCode: string | null;
  onCountrySelect: (code: string) => void;
  layers: GlobeLayerState;
  onLayersChange: (layers: GlobeLayerState) => void;
}

const ACTIVE_COUNTRIES = WATCHLIST_COUNTRIES.filter(
  (c) => c.code !== "P1" && c.code !== "P2"
).sort((a, b) => b.riskScore - a.riskScore);

function Sparkline({ data, color, className }: { data: number[]; color: string; className?: string }) {
  if (!data.length) return null;
  const w = 44;
  const h = 14;
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
  return (
    <svg className={className} width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={pts} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function watchlistSparkData(score: number): number[] {
  return [score - 8, score - 5, score - 3, score - 1, score - 2, score + 1, score].map((v) =>
    Math.max(0, Math.min(100, v))
  );
}

export function GlobeLeftPanel({
  selectedCode,
  onCountrySelect,
  layers,
  onLayersChange,
}: Props) {
  const toggleLayer = (key: LayerKey) =>
    onLayersChange({ ...layers, [key]: !layers[key] });

  return (
    <div className="w-[300px] min-w-[300px] h-full flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
      {/* Scrollable body: Watchlist + Movers + Map Layers */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-200">
          <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">Watchlist</h3>
          <div className="flex items-center gap-1">
            <button type="button" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600" aria-label="Add">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button type="button" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600" aria-label="More">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="6" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="18" r="1.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Watchlist table ─────────────────────────────────────── */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-[auto_1fr_1fr_auto_auto_44px] gap-x-2 gap-y-0 items-center text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200 pb-2 mb-2">
            <span className="col-span-2">Country</span>
            <span>Name</span>
            <span>Risk score</span>
            <span />
            <span />
          </div>
          {ACTIVE_COUNTRIES.map((country) => {
            const color = RISK_COLORS[country.riskLevel];
            const isSelected = selectedCode === country.code;
            const badgeBg = BADGE_BG[country.riskLevel] ?? BADGE_BG.MODERATE;
            return (
              <div
                key={country.code}
                onClick={() => onCountrySelect(country.code)}
                className="grid grid-cols-[auto_1fr_1fr_auto_auto_44px] gap-x-2 gap-y-1 items-center py-2.5 px-0 cursor-pointer transition-colors border-b border-slate-100 hover:bg-slate-50 rounded-md -mx-1 px-1"
                style={{ background: isSelected ? "#eff6ff" : undefined }}
              >
                <span className="text-base leading-none">{country.flag}</span>
                <span className="text-[13px] font-medium text-slate-800">{country.code}</span>
                <span className="text-[13px] text-slate-800 truncate" title={country.name}>{country.name}</span>
                <span className="text-[13px] font-bold tabular-nums" style={{ color }}>
                  {country.riskScore}
                </span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
                  style={{ backgroundColor: badgeBg, color }}
                >
                  {country.riskLevel}
                </span>
                <Sparkline data={watchlistSparkData(country.riskScore)} color={color} className="shrink-0" />
              </div>
            );
          })}
        </div>

        {/* ── Movers ───────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-t border-slate-200">
          <h3 className="text-[15px] font-bold text-slate-800 tracking-tight mb-2">Movers</h3>
          <div className="space-y-2">
            {TOP_ESCALATING.slice(0, 3).map((m) => (
              <div key={m.country} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0">
                <span className="text-red-500 shrink-0" aria-hidden>▲</span>
                <span className="text-[13px] text-slate-800">Risk shift</span>
                <span className="text-[13px] font-bold text-red-600 tabular-nums">+{m.delta}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 uppercase">High</span>
                <Sparkline data={[60, 62, 65, 68, 72, 75, 75 + m.delta]} color="#dc2626" className="shrink-0 ml-auto" />
              </div>
            ))}
            {TOP_DEESCALATING.slice(0, 2).map((m) => (
              <div key={m.country} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0">
                <span className="text-green-500 shrink-0" aria-hidden>▼</span>
                <span className="text-[13px] text-slate-800">Risk shift</span>
                <span className="text-[13px] font-bold text-green-600 tabular-nums">{m.delta}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 uppercase">High</span>
                <Sparkline data={[70, 68, 65, 62, 60, 58, 60 + m.delta]} color="#16a34a" className="shrink-0 ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Map Layers ───────────────────────────────────────────── */}
        <div className="px-4 py-3 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">Map Layers</h3>
            <button type="button" className="p-1 rounded-md hover:bg-slate-100 text-slate-600" aria-label="Layers options">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="6" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="18" r="1.5" />
              </svg>
            </button>
          </div>
          <div className="space-y-1">
            {LAYER_CONFIG.map(({ key, label, status }) => (
              <label
                key={key}
                className="flex items-center gap-2 py-2 px-1 rounded-md hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
              >
                <input
                  type="checkbox"
                  checked={layers[key]}
                  onChange={() => toggleLayer(key)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-500"
                />
                <span className="text-[13px] font-medium text-slate-800 flex-1">{label}</span>
                <span className="text-[11px] text-slate-500">Status</span>
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: status === "green" ? "#22c55e" : "#ea580c",
                  }}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
