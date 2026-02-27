"use client";

import { useState } from "react";

const TIME_WINDOWS = ["24h", "7d", "30d", "90d"] as const;
type TimeWindow = (typeof TIME_WINDOWS)[number];

interface Props {
  is3D: boolean;
  onToggle: () => void;
}

export function GlobeControls({ is3D, onToggle }: Props) {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("7d");
  const viewMode = is3D ? "3D" : "2D";
  const setViewMode = (mode: "2D" | "3D") => {
    if ((mode === "3D") !== is3D) onToggle();
  };

  return (
    <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
      <div className="flex bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-slate-300 overflow-hidden">
        {TIME_WINDOWS.map((t) => (
          <button
            key={t}
            onClick={() => setTimeWindow(t)}
            className={`px-3 py-1.5 text-[11px] font-medium transition-colors border-r border-slate-300 last:border-r-0 ${
              timeWindow === t
                ? "bg-slate-800 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-slate-300 overflow-hidden">
        {(["2D", "3D"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={`px-3 py-1.5 text-[11px] font-medium transition-colors border-r border-slate-300 last:border-r-0 ${
              viewMode === v
                ? "bg-slate-800 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
