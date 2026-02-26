"use client";

import { useScenario } from "@/lib/scenario-context";
import { Radio } from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  LOW: "#22c55e", MODERATE: "#eab308", ELEVATED: "#f97316", HIGH: "#ef4444", CRITICAL: "#991b1b",
};

export function EventTicker() {
  const { scenario } = useScenario();

  const items = scenario.countries.flatMap((c) =>
    c.headlines.map((h, i) => ({
      id: `${c.code}-${i}`,
      country: c.name,
      countryCode: c.code,
      riskLevel: c.riskLevel,
      headline: h,
    }))
  );

  return (
    <div className="h-full flex items-center gap-4 overflow-hidden">
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <Radio size={16} className="text-red-500 live-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider text-red-500">SIGACT</span>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex gap-6 animate-ticker whitespace-nowrap">
          {[...items, ...items].map((item, i) => (
            <span key={`${item.id}-${i}`} className="inline-flex items-center gap-2 text-sm">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: RISK_COLORS[item.riskLevel] }}
              />
              <span className="font-semibold" style={{ color: "var(--content-text)" }}>
                {item.country}:
              </span>
              <span style={{ color: "var(--content-text-secondary)" }}>{item.headline}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
