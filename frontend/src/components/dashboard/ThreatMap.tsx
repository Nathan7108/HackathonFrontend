"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { ACTIVE_COUNTRIES } from "@/lib/placeholder-data";

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "#dc2626",
  HIGH: "#ef4444",
  ELEVATED: "#f97316",
  MODERATE: "#eab308",
  LOW: "#22c55e",
};

// Pre-computed equirectangular coords (lon+180, 90-lat) in 0-360, 0-180 space
const COUNTRY_COORDS: Record<string, { x: number; y: number }> = {
  UA: { x: 210.5, y: 41.6 },
  IR: { x: 233.7, y: 57.6 },
  TW: { x: 300.9, y: 66.3 },
  ET: { x: 220.5, y: 80.9 },
  PK: { x: 249.3, y: 59.6 },
  VE: { x: 113.4, y: 83.6 },
  RS: { x: 201.0, y: 46.0 },
  BR: { x: 128.1, y: 104.2 },
};

type TimeWindow = "24h" | "7d" | "30d" | "90d";

const MAP_ROUTES: Array<[string, string]> = [
  ["UA", "IR"],
  ["IR", "PK"],
  ["PK", "TW"],
  ["ET", "IR"],
  ["VE", "BR"],
  ["UA", "RS"],
];

function routePath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 - 10;
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
}

function SvgWorldCanvas() {
  return (
    <div
      className="relative w-full h-full"
      style={{ background: "linear-gradient(180deg, #e8f2ff 0%, #f2f7fb 60%, #edf4fa 100%)" }}
    >
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" style={{ pointerEvents: "none" }}>
        <defs>
          <radialGradient id="oceanGlow" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.08" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#oceanGlow)" />
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={`${(i + 1) * 11.1}%`}
            x2="100%"
            y2={`${(i + 1) * 11.1}%`}
            stroke="#c8d6e5"
            strokeWidth="0.75"
            opacity="0.55"
          />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={`${(i + 1) * 7.69}%`}
            y1="0"
            x2={`${(i + 1) * 7.69}%`}
            y2="100%"
            stroke="#c8d6e5"
            strokeWidth="0.75"
            opacity="0.55"
          />
        ))}
      </svg>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 180" preserveAspectRatio="xMidYMid meet" style={{ pointerEvents: "none" }}>
        <ellipse cx={80} cy={65} rx={52} ry={48} fill="#cfd8c5" opacity={0.96} />
        <ellipse cx={105} cy={128} rx={30} ry={42} fill="#c8d2bf" opacity={0.96} />
        <ellipse cx={192} cy={55} rx={24} ry={26} fill="#d6ddcb" opacity={0.96} />
        <ellipse cx={200} cy={115} rx={32} ry={46} fill="#c8d2bf" opacity={0.96} />
        <ellipse cx={225} cy={72} rx={20} ry={18} fill="#d4dcc9" opacity={0.96} />
        <ellipse cx={260} cy={82} rx={22} ry={20} fill="#d4dcc9" opacity={0.96} />
        <ellipse cx={300} cy={60} rx={38} ry={36} fill="#cdd7c3" opacity={0.96} />
        <ellipse cx={308} cy={132} rx={28} ry={18} fill="#c8d2bf" opacity={0.96} />
        <ellipse cx={250} cy={38} rx={60} ry={22} fill="#dfe5d6" opacity={0.95} />
      </svg>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 180" preserveAspectRatio="xMidYMid meet" style={{ pointerEvents: "none" }}>
        {MAP_ROUTES.map(([fromCode, toCode], idx) => {
          const from = COUNTRY_COORDS[fromCode];
          const to = COUNTRY_COORDS[toCode];
          if (!from || !to) return null;
          return (
            <path
              key={`${fromCode}-${toCode}-${idx}`}
              d={routePath(from, to)}
              fill="none"
              stroke="#3b82f6"
              strokeOpacity="0.22"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
          );
        })}
        {ACTIVE_COUNTRIES.map((country) => {
          const coords = COUNTRY_COORDS[country.code];
          if (!coords) return null;
          const color = RISK_COLORS[country.riskLevel];
          const r = 3.5 + country.riskScore / 22;
          return (
            <g key={country.code}>
              {country.anomaly.detected && (
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={r + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.2"
                  opacity="0.35"
                />
              )}
              <circle cx={coords.x} cy={coords.y} r={r + 2} fill={color} opacity="0.2" />
              <circle cx={coords.x} cy={coords.y} r={r} fill={color} opacity={0.9} stroke="white" strokeWidth="0.8" />
              <text x={coords.x} y={coords.y - r - 2} textAnchor="middle" fontSize="5.5" fill="#374151" fontWeight="700" fontFamily="system-ui, sans-serif">{country.code}</text>
              <text x={coords.x} y={coords.y + r + 7} textAnchor="middle" fontSize="4.5" fill={color} fontWeight="600" fontFamily="system-ui, sans-serif">{country.riskScore}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ThreatMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("7d");
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef<unknown[]>([]);
  const mapRef = useRef<any>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const hasToken = !!token && token !== "your_mapbox_token_here";

  useEffect(() => {
    if (!hasToken || !mapContainer.current) return;

    import("mapbox-gl").then((mb) => {
      const mapboxgl = mb.default ?? mb;
      if (!mapContainer.current) return;
      (mapboxgl as any).accessToken = token;

      const map = new (mapboxgl as any).Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [18, 24],
        zoom: 1.45,
        pitch: 18,
        bearing: -8,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on("load", () => {
        if ((map as any).setFog) {
          (map as any).setFog({
            color: "rgb(233, 242, 255)",
            "high-color": "rgb(215, 230, 250)",
            "horizon-blend": 0.16,
          });
        }

        markersRef.current.forEach((m: any) => m?.remove?.());
        markersRef.current = [];

        ACTIVE_COUNTRIES.forEach((country) => {
          const color = RISK_COLORS[country.riskLevel];
          const size = Math.min(24, Math.max(14, 8 + country.riskScore / 12));

          const el = document.createElement("div");
          el.style.cssText = `
            position: relative;
            display: flex; align-items: center; justify-content: center;
            width: ${size}px; height: ${size}px;
            background: radial-gradient(circle at 35% 35%, #ffffff 0%, ${color} 56%, ${color}dd 100%);
            border-radius: 50%;
            border: 1.5px solid rgba(255,255,255,0.95);
            box-shadow: 0 0 0 4px ${color}22, 0 3px 10px rgba(0,0,0,0.24);
            cursor: pointer; opacity: 0.95;
          `;
          const core = document.createElement("div");
          core.style.cssText = `
            width: 4px; height: 4px; border-radius: 50%;
            background: rgba(255,255,255,0.9);
          `;
          el.appendChild(core);
          if (country.anomaly.detected) {
            el.classList.add("marker-pulse-anim");
          }

          const marker = new (mapboxgl as any).Marker({ element: el })
            .setLngLat([country.longitude, country.latitude])
            .addTo(map);
          markersRef.current.push(marker);
        });

        setMapReady(true);
      });
    });

    return () => {
      markersRef.current.forEach((m: any) => m?.remove?.());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, [hasToken, token]);

  const timeWindows: TimeWindow[] = ["24h", "7d", "30d", "90d"];

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Global Threat Map</span>
          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-green-50">
            <span className="relative flex h-1.5 w-1.5">
              <span className="light-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </span>
            <span className="text-[9px] font-bold text-green-600 uppercase">Live</span>
          </span>
        </div>
        <div className="flex gap-0.5">
          {timeWindows.map((w) => (
            <button
              key={w}
              onClick={() => setTimeWindow(w)}
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors"
              style={{
                background: timeWindow === w ? "#2563eb" : "#f1f5f9",
                color: timeWindow === w ? "white" : "#64748b",
              }}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        {hasToken ? (
          <div
            ref={mapContainer}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: mapReady ? 1 : 0, transition: "opacity 0.4s ease" }}
          />
        ) : (
          <div className="absolute inset-0">
            <SvgWorldCanvas />
          </div>
        )}

        {!mapReady && hasToken && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80">
            <span className="text-xs text-gray-500">Loading map…</span>
          </div>
        )}

        <div className="absolute bottom-1.5 left-2 flex items-center gap-2 px-2 py-1 rounded bg-white/90 backdrop-blur-sm shadow-sm z-10">
          {Object.entries(RISK_COLORS).map(([level, color]) => (
            <span key={level} className="flex items-center gap-0.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[9px] text-gray-600 uppercase">{level.slice(0, 4)}</span>
            </span>
          ))}
        </div>
        <div className="absolute bottom-1.5 right-2 z-10">
          <span className="text-[9px] text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">201 countries monitored</span>
        </div>
      </div>
    </div>
  );
}
