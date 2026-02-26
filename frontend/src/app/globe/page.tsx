"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { GlobeLeftPanel, type GlobeLayerState } from "@/components/globe/GlobeLeftPanel";
import { GlobeDetailPanel } from "@/components/globe/GlobeDetailPanel";
import { GlobeControls } from "@/components/globe/GlobeControls";
import { GlobeLegend } from "@/components/globe/GlobeLegend";
import { GlobeBottomPanel } from "@/components/globe/GlobeBottomPanel";
import { WATCHLIST_COUNTRIES } from "@/lib/placeholder-data";

const GlobeMap = dynamic(
  () => import("@/components/globe/GlobeMap"),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-slate-50" /> }
);

const DEFAULT_LAYERS: GlobeLayerState = {
  conflictZones: true,
  anomalyAlerts: true,
  facilities: true,
  tradeRoutes: false,
  infrastructure: false,
};

export default function GlobePage() {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [layers, setLayers] = useState<GlobeLayerState>(DEFAULT_LAYERS);
  const [is3D, setIs3D] = useState(false);

  const selectedCountry = WATCHLIST_COUNTRIES.find((c) => c.code === selectedCode) ?? null;

  const handleCountrySelect = useCallback((code: string) => {
    if (!code) {
      setSelectedCode(null);
      return;
    }
    setSelectedCode((prev) => (prev === code ? null : code));
  }, []);

  return (
    <div className="flex flex-col min-h-full overflow-y-auto overflow-x-hidden">
      {/* ── Top row: left panel + map — map is main focus (tall, wide) ── */}
      <div className="flex shrink-0 min-h-[520px]" style={{ height: "72vh" }}>
        <GlobeLeftPanel
          selectedCode={selectedCode}
          onCountrySelect={handleCountrySelect}
          layers={layers}
          onLayersChange={setLayers}
        />

        {/* Map Area */}
        <div className="flex-1 relative min-w-0 overflow-hidden">
          <GlobeMap
            onCountrySelect={handleCountrySelect}
            selectedCode={selectedCode}
            is3D={is3D}
            layers={layers}
          />

          <GlobeControls is3D={is3D} onToggle={() => setIs3D((v) => !v)} />
          <GlobeLegend />

          {/* Live status badge */}
          <div className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 px-2.5 py-1.5 text-[10px] text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              <span className="font-mono font-medium text-gray-700">LIVE</span>
              <span className="text-gray-400">·</span>
              <span className="font-mono">37 events</span>
              <span className="text-gray-400">·</span>
              <span className="font-mono">5 anomalies</span>
              <span className="text-gray-400">·</span>
              <span className="font-mono">201 countries</span>
            </div>
          </div>

          {/* Right detail panel slides in on country click */}
          {selectedCountry && (
            <GlobeDetailPanel
              country={selectedCountry}
              onClose={() => setSelectedCode(null)}
            />
          )}
        </div>
      </div>

      {/* ── Bottom panel: full width intelligence data ──────────────── */}
      <GlobeBottomPanel onCountrySelect={handleCountrySelect} />
    </div>
  );
}
