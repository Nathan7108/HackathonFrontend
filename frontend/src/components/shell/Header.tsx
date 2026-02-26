"use client";

import { useState, useEffect, useRef } from "react";
import { Search, AlertTriangle, X, Command, Check } from "lucide-react";
import { ScenarioPicker } from "./ScenarioPicker";
import { useScenario } from "@/lib/scenario-context";
import { usePathname } from "next/navigation";

const RISK_COLORS: Record<string, string> = {
  LOW: "#22c55e", MODERATE: "#eab308", ELEVATED: "#f97316", HIGH: "#ef4444", CRITICAL: "#991b1b",
};

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/globe": "Globe",
  "/countries": "Countries",
  "/alerts": "Alerts",
  "/intelligence": "Intelligence",
  "/forecasts": "Forecasts",
  "/settings": "Settings",
};

export function Header() {
  const { scenario } = useScenario();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const anomalyCount = scenario.alerts.filter((a) => a.type === "ANOMALY").length;
  const highCount = scenario.countries.filter(
    (c) => c.riskLevel === "HIGH" || c.riskLevel === "CRITICAL"
  ).length;
  const sourcesTotal = scenario.modelHealth?.sources ?? 6;
  const sourcesConnected = sourcesTotal;
  const countryCount = scenario.modelHealth?.countries ?? 201;

  const pageTitle = PAGE_TITLES[pathname] ?? "Sentinel AI";

  // Keyboard shortcut: Cmd+K or Ctrl+K opens search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const searchMatches = (c: { name: string; code: string }) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase());
  const searchResults = scenario.countries.filter(searchMatches);

  return (
    <header
      className="h-14 flex items-center gap-6 pl-6 pr-6 shrink-0 min-w-0"
      style={{ background: "var(--shell-bg)" }}
    >
      {/* Left — Page, scenario, search in one flow */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <h1 className="text-base font-semibold whitespace-nowrap shrink-0" style={{ color: "var(--shell-text-active)" }}>
          {pageTitle}
        </h1>
        <span className="text-gray-400 shrink-0">/</span>
        <ScenarioPicker />

        {/* Search — square with rounded corners, larger */}
        {searchOpen ? (
          <div className="relative shrink-0">
            <div
              className="flex items-center gap-3 w-[280px] pl-4 pr-3 py-2.5 rounded-lg border transition-colors"
              style={{
                background: "var(--content-bg)",
                borderColor: "var(--accent)",
                boxShadow: "0 0 0 1px var(--accent)",
              }}
            >
              <Search size={16} className="text-blue-500 shrink-0 opacity-80" />
              <input
                ref={searchRef}
                type="text"
                placeholder={`${countryCount} countries…`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-0 text-base bg-transparent outline-none font-data placeholder:opacity-60"
                style={{ color: "var(--content-text)" }}
                autoFocus
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="p-1 rounded-md hover:bg-black/5 shrink-0"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {searchQuery.length > 0 && (
              <div
                className="absolute top-full left-0 mt-1.5 w-72 rounded-xl shadow-lg border overflow-hidden z-50"
                style={{ background: "var(--content-bg)", borderColor: "var(--content-border)" }}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((c) => (
                    <div
                      key={c.code}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-black/5 cursor-pointer"
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: RISK_COLORS[c.riskLevel] }} />
                      <span className="text-sm font-medium min-w-0 truncate" style={{ color: "var(--content-text)" }}>
                        {c.name}
                      </span>
                      <span className="text-xs shrink-0 opacity-60" style={{ color: "var(--shell-text)" }}>{c.code}</span>
                      <span className="ml-auto text-sm font-bold font-data shrink-0" style={{ color: RISK_COLORS[c.riskLevel] }}>
                        {c.riskScore}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-3.5 py-3 text-sm text-gray-400">No results</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 w-[260px] pl-4 pr-4 py-2.5 rounded-lg border text-left transition-colors shrink-0"
            style={{
              background: "var(--content-bg)",
              borderColor: "var(--shell-border)",
              color: "var(--shell-text)",
            }}
          >
            <Search size={16} className="shrink-0 opacity-60" />
            <span className="flex-1 text-base truncate">Search {countryCount} countries…</span>
            <kbd className="hidden sm:inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border shrink-0 opacity-70"
              style={{ borderColor: "var(--shell-border)", color: "var(--shell-text)" }}>
              <Command size={11} />K
            </kbd>
          </button>
        )}
      </div>

      {/* Right — Indicators, slightly inset from edge */}
      <div
        className="flex items-center gap-5 shrink-0 pl-6 py-1.5 pr-4 mr-12 rounded-xl"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--shell-border)" }}
      >
        <div
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg"
          style={{ background: `${RISK_COLORS[scenario.gtiLevel]}22` }}
        >
          <span className="text-base font-bold font-mono tabular-nums" style={{ color: RISK_COLORS[scenario.gtiLevel] }}>
            {scenario.gti}
          </span>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-md"
            style={{ color: "#fff", background: RISK_COLORS[scenario.gtiLevel] }}
          >
            {scenario.gtiLevel}
          </span>
        </div>

        <div className="flex items-center gap-5 text-xs font-semibold font-mono tabular-nums" style={{ color: "var(--shell-text-active)" }}>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>{highCount} high+</span>
          </span>
          <span className="flex items-center gap-2">
            <AlertTriangle size={13} className="text-orange-500 shrink-0" />
            <span>{anomalyCount} alerts</span>
          </span>
          <span className="flex items-center gap-2 text-emerald-600">
            <Check size={13} className="shrink-0" />
            <span>{sourcesConnected}/{sourcesTotal}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="light-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500">Live</span>
        </div>

        <span className="text-xs font-mono tabular-nums font-medium text-gray-400">2m ago</span>

        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
          style={{ background: "var(--shell-bg-hover)", color: "var(--shell-text-active)", border: "1px solid var(--shell-border)" }}
        >
          N
        </div>
      </div>
    </header>
  );
}
