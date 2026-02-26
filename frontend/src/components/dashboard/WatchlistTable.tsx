"use client";

import Link from "next/link";
import { TOP_ESCALATING, TOP_DEESCALATING } from "@/lib/dashboard-data";
import { getCountryFlagEmoji } from "@/lib/country-flag";
import { Sparkline } from "./Sparkline";
import type { DashboardCountry } from "@/lib/types";

const RISK_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#ca8a04",
  ELEVATED: "#ea580c",
  HIGH: "#dc2626",
  CRITICAL: "#991b1b",
};

const RISK_BG: Record<string, string> = {
  LOW: "#f0fdf4",
  MODERATE: "#fefce8",
  ELEVATED: "#fff7ed",
  HIGH: "#fef2f2",
  CRITICAL: "#fef2f2",
};

const LEVEL_ABBR: Record<string, string> = {
  LOW: "LO",
  MODERATE: "MOD",
  ELEVATED: "ELV",
  HIGH: "HI",
  CRITICAL: "CRT",
};

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-green-50">
      <span className="relative flex h-1.5 w-1.5">
        <span className="light-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
      </span>
      <span className="text-[9px] font-bold text-green-600 uppercase">Live</span>
    </span>
  );
}

const COL_TEMPLATE = "20px minmax(0,1fr) 44px 42px 38px 46px 22px 22px";

interface WatchlistTableProps {
  countries: DashboardCountry[];
}

export function WatchlistTable({ countries }: WatchlistTableProps) {
  const sorted = [...countries].sort((a, b) => b.riskScore - a.riskScore);
  const rows = sorted.slice(0, 20);

  return (
    <div className="flex flex-col h-full min-w-0 bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex items-center justify-between pl-3 pr-3 py-2 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Watchlist</span>
          <LiveBadge />
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
            {rows.length} monitored
          </span>
        </div>
      </div>

      <div
        className="grid pl-3 pr-3 py-1.5 text-[11px] uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-100 shrink-0"
        style={{ gridTemplateColumns: COL_TEMPLATE }}
      >
        <span>#</span>
        <span>Country</span>
        <span className="text-right">Score</span>
        <span className="text-right">Δ30d</span>
        <span className="text-center">Level</span>
        <span className="text-center">Trend</span>
        <span className="text-center">Sent.</span>
        <span className="text-center">Alert</span>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 overscroll-contain scrollbar-thin">
        {rows.map((country, idx) => {
          const color = RISK_COLORS[country.riskLevel] ?? "#6b7280";
          const bg = RISK_BG[country.riskLevel] ?? "#f9fafb";
          const abbr = LEVEL_ABBR[country.riskLevel] ?? "—";

          const rs = country.riskScore;
          const sparkData = [rs - 8, rs - 5, rs - 3, rs - 1, rs - 2, rs + 1, rs].map((v) =>
            Math.max(0, Math.min(100, v))
          );

          const sentColor = rs > 65 ? "#ef4444" : rs > 40 ? "#6b7280" : "#22c55e";
          const isEven = idx % 2 === 0;

          return (
            <Link
              key={`${country.code}-${idx}`}
              href={`/country/${country.code}`}
              className="grid items-center pl-3 pr-3 hover:bg-blue-50/50 transition-colors shrink-0 min-w-0"
              style={{
                gridTemplateColumns: COL_TEMPLATE,
                height: 44,
                background: isEven ? "white" : "rgba(249,250,251,0.5)",
                textDecoration: "none",
                display: "grid",
              }}
            >
              <span className="text-xs text-gray-400 font-semibold tabular-nums">{idx + 1}</span>

              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm">{getCountryFlagEmoji(country.code)}</span>
                <span className="text-[13px] font-medium text-gray-800 truncate">{country.name}</span>
              </div>

              <div className="relative flex items-center justify-end gap-1" style={{ height: 22 }}>
                <div
                  className="absolute left-0 top-0 bottom-0 rounded"
                  style={{ width: `${country.riskScore}%`, background: color, opacity: 0.18 }}
                />
                <span className="relative text-sm font-bold tabular-nums" style={{ color }}>
                  {country.riskScore}
                </span>
                <span className="relative text-[10px] text-gray-400">pts</span>
              </div>

              <div className="flex items-center justify-end">
                <span className="text-xs text-gray-300">—</span>
              </div>

              <div className="flex items-center justify-center" title={country.riskLevel}>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: bg, color }}>
                  {abbr}
                </span>
              </div>

              <div className="flex items-center justify-center min-w-0">
                <Sparkline data={sparkData} width={42} height={14} color={color} />
              </div>

              <div className="flex items-center justify-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: sentColor }} />
              </div>

              <div className="flex items-center justify-center gap-0.5">
                {country.isAnomaly ? (
                  <>
                    <span className="text-orange-500 text-sm">⚠</span>
                    <span className="text-[10px] font-medium text-orange-600">Yes</span>
                  </>
                ) : (
                  <span className="text-[10px] text-gray-300">—</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-gray-100 pl-3 pr-3 py-1.5 space-y-0.5">
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-red-500 font-bold">▲</span>
          {TOP_ESCALATING.slice(0, 3).map((m) => (
            <span key={m.country} className="text-red-500 font-semibold tabular-nums">
              {m.country} +{m.delta}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-green-600 font-bold">▼</span>
          {TOP_DEESCALATING.slice(0, 3).map((m) => (
            <span key={m.country} className="text-green-600 font-semibold tabular-nums">
              {m.country} {m.delta}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
