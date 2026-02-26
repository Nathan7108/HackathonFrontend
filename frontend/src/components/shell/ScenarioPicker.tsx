"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import { useScenario } from "@/lib/scenario-context";

export function ScenarioPicker() {
  const { scenario, setScenario, scenarios } = useScenario();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        style={{
          background: open ? "var(--shell-bg-hover)" : "transparent",
          color: "var(--shell-text-active)",
        }}
      >
        <Building2 size={15} className="text-blue-600" />
        <span>{scenario.name}</span>
        <span className="text-xs px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 font-medium">
          {scenario.industry}
        </span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--shell-text)" }} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-80 rounded-xl shadow-lg border overflow-hidden z-50"
          style={{ background: "var(--content-bg)", borderColor: "var(--content-border)" }}
        >
          <div className="px-3 py-2 border-b" style={{ borderColor: "var(--content-border)" }}>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--shell-text)" }}>
              Demo Scenario
            </span>
          </div>
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => { setScenario(s.id); setOpen(false); }}
              className="w-full px-3 py-2.5 flex items-start gap-3 text-left transition-colors hover:bg-gray-50"
              style={{
                background: s.id === scenario.id ? "var(--accent-light)" : undefined,
              }}
            >
              <span className="text-lg mt-0.5">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: "var(--content-text)" }}>
                  {s.name}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--shell-text)" }}>
                  {s.industry} · {s.countries.length} countries monitored
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--shell-text)" }}>
                  {s.description}
                </div>
              </div>
              {s.id === scenario.id && (
                <span className="text-blue-600 text-xs font-medium mt-1">Active</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
