"use client";

export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-3 pr-4 bg-slate-800 text-white shrink-0 overflow-hidden" style={{ height: 28, fontSize: 10 }}>
      {/* Left: Brand + LIVE */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="light-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="font-bold uppercase tracking-widest text-white/90" style={{ letterSpacing: "0.12em" }}>
          GLOBAL SENTINEL — COMMAND OVERVIEW
        </span>
      </div>

      {/* Right: System health stats */}
      <div className="flex items-center gap-2 text-gray-300 overflow-hidden min-w-0" style={{ fontVariantNumeric: "tabular-nums" }}>
        {/* 6 source dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
          ))}
          <span className="ml-1 font-mono">6/6 SOURCES ACTIVE</span>
        </div>

        <span className="text-gray-500">|</span>

        <span className="text-green-400 font-mono font-semibold">PIPELINE HEALTHY ✓</span>

        <span className="text-gray-500">|</span>

        <span className="font-mono">LAST UPDATED 2m AGO</span>

        <span className="text-gray-500">|</span>

        <span className="font-mono">47 FEATURES · 201 MODELS · 75yr DATA</span>
      </div>
    </div>
  );
}
