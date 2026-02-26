"use client";

import { BarChart2, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useScenario } from "@/lib/scenario-context";
import Link from "next/link";

const RISK_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  ELEVATED: "#f97316",
  HIGH: "#ef4444",
  CRITICAL: "#991b1b",
};

const TREND_ICON = {
  ESCALATING: TrendingUp,
  STABLE: Minus,
  "DE-ESCALATING": TrendingDown,
};

export default function AnalysisPage() {
  const { scenario, watchlist } = useScenario();

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-2">
          <BarChart2 size={22} style={{ color: "var(--accent)" }} />
          <h1 className="text-xl font-bold" style={{ color: "var(--content-text)" }}>
            Analysis
          </h1>
        </div>
        <p className="text-sm max-w-2xl" style={{ color: "var(--content-text-secondary)" }}>
          Threat intelligence analysis and reporting. Select a country below to open the full Country Analysis: intelligence brief, 7-step causal chain, risk forecast, and ML transparency.
        </p>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--shell-text)" }}>
            Your watchlist — {scenario.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {watchlist.map((country) => {
              const color = RISK_COLORS[country.riskLevel] ?? "#6b7280";
              const TrendIcon = TREND_ICON[country.trend];
              return (
                <Link
                  key={country.code}
                  href={`/country/${country.code}`}
                  className="group rounded-xl border p-4 block text-left transition hover:shadow-md"
                  style={{
                    borderColor: "var(--content-border)",
                    background: "var(--content-bg)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-data" style={{ color }}>
                          {country.riskScore}
                        </span>
                        <span
                          className="rounded px-2 py-0.5 text-[10px] font-bold text-white"
                          style={{ background: color }}
                        >
                          {country.riskLevel}
                        </span>
                      </div>
                      <h3 className="mt-1 font-semibold" style={{ color: "var(--content-text)" }}>
                        {country.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: "var(--shell-text)" }}>
                        <TrendIcon size={12} style={{ color: country.trend === "ESCALATING" ? "#ef4444" : country.trend === "DE-ESCALATING" ? "#22c55e" : "#6b7280" }} />
                        {country.trend === "ESCALATING" && `+${country.changePercent} pts 30d`}
                        {country.trend === "DE-ESCALATING" && `${country.changePercent} pts 30d`}
                        {country.trend === "STABLE" && "Stable"}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full p-1.5 transition group-hover:opacity-80" style={{ color: "var(--accent)" }}>
                      <ArrowRight size={18} />
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-medium" style={{ color: "var(--accent)" }}>
                    View full analysis →
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {watchlist.length === 0 && (
          <div
            className="rounded-xl border border-dashed p-8 text-center"
            style={{ borderColor: "var(--content-border)", background: "var(--content-bg)" }}
          >
            <p className="text-sm" style={{ color: "var(--content-text-secondary)" }}>
              No countries on your watchlist. Add countries from the Dashboard to see analysis links here.
            </p>
            <Link
              href="/dashboard"
              className="mt-3 inline-block text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
