"use client";

import { useScenario } from "@/lib/scenario-context";
import { getCountryAnalysis, type CountryAnalysisData } from "@/lib/country-analysis-data";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  BarChart3,
  FileText,
  MapPin,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useMemo, useState } from "react";

const RISK_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  ELEVATED: "#f97316",
  HIGH: "#ef4444",
  CRITICAL: "#991b1b",
};

const TREND_CONFIG: Record<string, { label: string; color: string; Icon: typeof TrendingUp }> = {
  ESCALATING: { label: "Escalating", color: "#ef4444", Icon: TrendingUp },
  STABLE: { label: "Stable", color: "#6b7280", Icon: Minus },
  "DE-ESCALATING": { label: "De-escalating", color: "#22c55e", Icon: TrendingDown },
};

const DATA_SOURCE_COLORS: Record<string, string> = {
  GDELT: "#2563eb",
  ACLED: "#dc2626",
  UCDP: "#ca8a04",
  FinBERT: "#059669",
  LSTM: "#7c3aed",
  Sentinel: "#0d9488",
};

function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

// —— Hero ——
function HeroSection({ data }: { data: CountryAnalysisData }) {
  const { country, lastUpdated, modelConfidence, acledEventsThisMonth, headlineSentimentPct, anomalyStatus, lstmForecastDirection } = data;
  const riskColor = RISK_COLORS[country.riskLevel] ?? "#6b7280";
  const trend = TREND_CONFIG[country.trend];
  const changeText = country.changePercent >= 0 ? `↑${country.changePercent} pts in 30d` : `↓${Math.abs(country.changePercent)} pts in 30d`;

  return (
    <section
      className="relative overflow-hidden rounded-xl border p-6 md:p-8"
      style={{
        borderColor: "var(--content-border)",
        background: `linear-gradient(135deg, var(--content-bg) 0%, ${riskColor}08 100%)`,
      }}
    >
      <div className="relative flex flex-wrap items-start justify-between gap-6">
        {/* Left: score + badge + trend */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-3">
            <span className="text-[72px] font-bold font-data leading-none" style={{ color: riskColor }}>
              {country.riskScore}
            </span>
            <div className="flex flex-col gap-1">
              <span
                className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold text-white"
                style={{ background: riskColor }}
              >
                {country.riskLevel}
              </span>
              <div className="flex items-center gap-1 text-sm font-medium" style={{ color: trend.color }}>
                <trend.Icon size={16} />
                {changeText}
              </div>
            </div>
          </div>
        </div>

        {/* Center: country + flag + meta */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{flagEmoji(country.code)}</span>
            <h1 className="text-2xl font-bold" style={{ color: "var(--content-text)" }}>
              {country.name}
            </h1>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--shell-text)" }}>
            Last updated {lastUpdated}
          </p>
          <p className="mt-0.5 text-xs font-medium" style={{ color: "var(--accent)" }}>
            {modelConfidence}% model confidence
          </p>
        </div>

        {/* Right: quick stats */}
        <div className="flex flex-wrap gap-4 rounded-lg border p-3" style={{ borderColor: "var(--content-border)", background: "var(--content-bg)" }}>
          <div className="text-center">
            <div className="text-lg font-bold font-data" style={{ color: "var(--content-text)" }}>{acledEventsThisMonth}</div>
            <div className="text-[10px] uppercase" style={{ color: "var(--shell-text)" }}>ACLED this month</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold font-data" style={{ color: headlineSentimentPct < 0 ? "#ef4444" : "var(--content-text)" }}>{headlineSentimentPct}%</div>
            <div className="text-[10px] uppercase" style={{ color: "var(--shell-text)" }}>Headline sentiment</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold" style={{ color: country.anomaly ? "#ef4444" : "var(--content-text)" }}>{anomalyStatus}</div>
            <div className="text-[10px] uppercase" style={{ color: "var(--shell-text)" }}>Anomaly</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold" style={{ color: trend.color }}>{lstmForecastDirection}</div>
            <div className="text-[10px] uppercase" style={{ color: "var(--shell-text)" }}>LSTM forecast</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// —— Intelligence Brief ——
function IntelligenceBriefSection({ data }: { data: CountryAnalysisData }) {
  const { intelligenceBrief, industriesExposed, keyFactors } = data;
  // Bold **phrase** in brief
  const parts = intelligenceBrief.split(/(\*\*[^*]+\*\*)/g).map((s, i) =>
    s.startsWith("**") && s.endsWith("**") ? <strong key={`b-${i}`}>{s.slice(2, -2)}</strong> : <span key={`b-${i}`}>{s}</span>
  );

  return (
    <section className="rounded-xl border p-6" style={{ borderColor: "var(--content-border)", background: "var(--content-bg)" }}>
      <div className="mb-3 flex items-center gap-2">
        <FileText size={18} style={{ color: "var(--accent)" }} />
        <h2 className="text-lg font-bold" style={{ color: "var(--content-text)" }}>Intelligence Brief</h2>
      </div>
      <div className="prose prose-sm max-w-none text-[15px] leading-relaxed" style={{ color: "var(--content-text-secondary)" }}>
        {parts}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--shell-text)" }}>Industries Exposed:</span>
        {industriesExposed.map((ind) => (
          <span
            key={ind}
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}
          >
            {ind}
          </span>
        ))}
      </div>
      <div
        className="mt-4 rounded-lg border-l-4 p-3"
        style={{ borderLeftColor: "var(--accent)", background: "var(--shell-bg)" }}
      >
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>Key Factors</div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm" style={{ color: "var(--content-text-secondary)" }}>
          {keyFactors.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// —— 7-Step Causal Chain ——
function CausalChainSection({ data }: { data: CountryAnalysisData }) {
  const { causalChain } = data;

  return (
    <section className="rounded-xl border p-6" style={{ borderColor: "var(--content-border)", background: "var(--content-bg)" }}>
      <div className="mb-4 flex items-center gap-2">
        <Activity size={18} style={{ color: "var(--accent)" }} />
        <h2 className="text-lg font-bold" style={{ color: "var(--content-text)" }}>7-Step Causal Chain</h2>
      </div>
      <p className="mb-6 text-sm" style={{ color: "var(--shell-text)" }}>
        No other tool shows you this. Not Palantir. Not Recorded Future.
      </p>

      <div className="relative">
        {/* vertical line */}
        <div
          className="absolute left-[19px] top-0 bottom-0 w-0.5"
          style={{ background: "var(--content-border)" }}
        />
        <div className="space-y-0">
          {causalChain.map((step) => (
            <div key={step.step} className="relative flex gap-4 pb-6 last:pb-0">
              <div
                className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold"
                style={{ borderColor: "var(--accent)", background: "var(--content-bg)", color: "var(--accent)" }}
              >
                {step.step}
              </div>
              <div
                className="min-w-0 flex-1 rounded-lg border p-4"
                style={{ borderColor: "var(--content-border)", background: "var(--shell-bg)" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold" style={{ color: "var(--content-text)" }}>{step.title}</h3>
                  {step.dataSource && (
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{ background: `${DATA_SOURCE_COLORS[step.dataSource] ?? "#6b7280"}22`, color: DATA_SOURCE_COLORS[step.dataSource] ?? "#6b7280" }}
                    >
                      {step.dataSource}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--content-text-secondary)" }}>
                  {step.description}
                </p>
                {step.confidence != null && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 max-w-[120px] overflow-hidden rounded-full" style={{ background: "var(--content-border)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${step.confidence}%`, background: "var(--accent)" }}
                      />
                    </div>
                    <span className="text-xs font-data" style={{ color: "var(--shell-text)" }}>{step.confidence}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// —— Risk Forecast Chart ——
function RiskForecastChartSection({ data }: { data: CountryAnalysisData }) {
  const { forecast } = data;
  const trend = TREND_CONFIG[forecast.trend];
  const historyLen = 90;
  const chartData = useMemo(() => {
    const arr: { day: number; historical?: number; forecast?: number; lower?: number; upper?: number }[] = [];
    const hist = forecast.history;
    const fc = forecast.forecastSeries;
    const lo = forecast.confidenceLower;
    const hi = forecast.confidenceUpper;
    for (let i = 0; i < historyLen; i++) {
      const idx = Math.min(hist.length - 1, Math.floor((i / historyLen) * hist.length));
      arr.push({ day: i - historyLen, historical: hist[idx] });
    }
    for (let i = 0; i < historyLen; i++) {
      const idx = Math.min(fc.length - 1, Math.floor((i / historyLen) * fc.length));
      arr.push({
        day: i,
        forecast: fc[idx],
        lower: lo[idx],
        upper: hi[idx],
      });
    }
    return arr;
  }, [forecast]);

  return (
    <section className="rounded-xl border p-6" style={{ borderColor: "var(--content-border)", background: "var(--content-bg)" }}>
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 size={18} style={{ color: "var(--accent)" }} />
        <h2 className="text-lg font-bold" style={{ color: "var(--content-text)" }}>Risk Forecast</h2>
      </div>
      <div
        className="mb-4 inline-flex items-center gap-2 rounded px-2 py-1 text-sm font-semibold"
        style={{ background: `${trend.color}18`, color: trend.color }}
      >
        <trend.Icon size={14} />
        {forecast.trend}
      </div>
      <div className="mb-2 flex gap-4 text-sm font-data">
        <span style={{ color: "var(--content-text)" }}>30d: {forecast.day30}</span>
        <span style={{ color: "var(--content-text)" }}>→ 60d: {forecast.day60}</span>
        <span style={{ color: "var(--content-text)" }}>→ 90d: {forecast.day90}</span>
      </div>
      <div className="h-[320px] min-h-[320px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--content-border)" />
            <XAxis
              dataKey="day"
              tickFormatter={(d) => (d === 0 ? "Today" : d < 0 ? `${d}` : `+${d}`)}
              stroke="var(--shell-text)"
              fontSize={11}
            />
            <YAxis domain={[0, 100]} stroke="var(--shell-text)" fontSize={11} tickFormatter={(v) => `${v}`} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0]?.payload;
                return (
                  <div className="rounded border bg-white p-2 shadow-lg" style={{ borderColor: "var(--content-border)" }}>
                    {p?.historical != null && <div>Historical: {p.historical}</div>}
                    {p?.forecast != null && <div>Forecast: {p.forecast}</div>}
                  </div>
                );
              }}
            />
            <ReferenceLine x={0} stroke="var(--content-text)" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="upper" stroke="none" fill="var(--accent)" fillOpacity={0.08} />
            <Area type="monotone" dataKey="lower" stroke="none" fill="var(--content-bg)" />
            <Area
              type="monotone"
              dataKey="historical"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="var(--accent)"
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeDasharray="6 4"
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

// —— Headlines & Events (2-col) ——
function HeadlinesAndEventsSection({ data }: { data: CountryAnalysisData }) {
  const { headlines, acledEvents } = data;
  const sentimentColor = (s: string) => (s === "NEGATIVE" ? "#ef4444" : s === "POSITIVE" ? "#22c55e" : "#6b7280");

  return (
    <section className="rounded-xl border p-6" style={{ borderColor: "var(--content-border)", background: "var(--content-bg)" }}>
      <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--content-text)" }}>Headlines & Events</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--shell-text)" }}>Recent Headlines (FinBERT)</h3>
          <ul className="space-y-3">
            {headlines.map((h) => (
              <li key={h.id} className="flex gap-2 border-l-2 pl-2" style={{ borderLeftColor: sentimentColor(h.sentiment) }}>
                <span className="shrink-0 text-[10px] font-bold uppercase" style={{ color: sentimentColor(h.sentiment) }}>{h.sentiment}</span>
                <div>
                  <p className="text-sm" style={{ color: "var(--content-text)" }}>{h.title}</p>
                  <p className="text-[10px]" style={{ color: "var(--shell-text)" }}>{h.confidence}% confidence · {h.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--shell-text)" }}>
            <MapPin size={12} /> Recent ACLED Events
          </h3>
          <ul className="space-y-3">
            {acledEvents.map((e) => (
              <li key={e.id} className="rounded border p-2" style={{ borderColor: "var(--content-border)" }}>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ background: "var(--shell-bg)", color: "var(--content-text)" }}
                  >
                    {e.type}
                  </span>
                  {e.fatalities != null && (
                    <span className="text-[10px]" style={{ color: "var(--shell-text)" }}>{e.fatalities} fatalities</span>
                  )}
                </div>
                <p className="mt-1 text-sm" style={{ color: "var(--content-text)" }}>{e.location}</p>
                <p className="text-[10px]" style={{ color: "var(--shell-text)" }}>{e.date} · {e.lat.toFixed(2)}, {e.lon.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// —— Your Assets at Risk ——
function AssetsAtRiskSection({ data }: { data: CountryAnalysisData }) {
  const { assetsAtRisk } = data;
  if (assetsAtRisk.length === 0) return null;

  const exposureColor = (e: string) => RISK_COLORS[e] ?? "#6b7280";

  return (
    <section className="rounded-xl border p-6" style={{ borderColor: "var(--content-border)", background: "var(--content-bg)" }}>
      <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--content-text)" }}>Your Assets at Risk</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--content-border)" }}>
              <th className="pb-2 text-left font-semibold" style={{ color: "var(--shell-text)" }}>Asset</th>
              <th className="pb-2 text-left font-semibold" style={{ color: "var(--shell-text)" }}>Type</th>
              <th className="pb-2 text-left font-semibold" style={{ color: "var(--shell-text)" }}>Distance</th>
              <th className="pb-2 text-left font-semibold" style={{ color: "var(--shell-text)" }}>Risk</th>
              <th className="pb-2 text-left font-semibold" style={{ color: "var(--shell-text)" }}>Recommended Action</th>
            </tr>
          </thead>
          <tbody>
            {assetsAtRisk.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid var(--content-border)" }}>
                <td className="py-2 font-medium" style={{ color: "var(--content-text)" }}>{a.name}</td>
                <td className="py-2" style={{ color: "var(--content-text-secondary)" }}>{a.type}</td>
                <td className="py-2" style={{ color: "var(--content-text-secondary)" }}>{a.distanceFromConflict}</td>
                <td className="py-2">
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold text-white"
                    style={{ background: exposureColor(a.riskExposure) }}
                  >
                    {a.riskExposure}
                  </span>
                </td>
                <td className="py-2" style={{ color: "var(--content-text-secondary)" }}>{a.recommendedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs" style={{ color: "var(--shell-text)" }}>Small map with asset pins relative to conflict clusters can be added here when you have map data.</p>
    </section>
  );
}

// —— ML Model Transparency (collapsible) ——
function MLTransparencySection({ data }: { data: CountryAnalysisData }) {
  const [open, setOpen] = useState(false);
  const { mlTransparency } = data;
  const maxVal = Math.max(...mlTransparency.featureImportance.map((f) => f.value));

  return (
    <section className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--content-border)", background: "var(--content-bg)" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left hover:opacity-90"
        style={{ background: "var(--shell-bg)" }}
      >
        <div className="flex items-center gap-2">
          <BarChart3 size={18} style={{ color: "var(--accent)" }} />
          <h2 className="text-lg font-bold" style={{ color: "var(--content-text)" }}>ML Model Transparency</h2>
        </div>
        {open ? <ChevronDown size={20} style={{ color: "var(--shell-text)" }} /> : <ChevronRight size={20} style={{ color: "var(--shell-text)" }} />}
      </button>
      {open && (
        <div className="border-t p-6" style={{ borderColor: "var(--content-border)" }}>
          <p className="mb-4 text-sm" style={{ color: "var(--content-text-secondary)" }}>
            Sentinel uses 47 engineered features from 6 authoritative data sources. The risk score is generated by XGBoost, not GPT-4o.
          </p>
          <h3 className="mb-2 text-xs font-semibold uppercase" style={{ color: "var(--shell-text)" }}>Feature importance (top 10)</h3>
          <div className="mb-6 space-y-2">
            {mlTransparency.featureImportance.map((f) => (
              <div key={f.name} className="flex items-center gap-3">
                <div className="w-32 shrink-0 truncate text-xs" style={{ color: "var(--content-text)" }}>{f.name}</div>
                <div className="h-2 flex-1 max-w-xs overflow-hidden rounded-full" style={{ background: "var(--content-border)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(f.value / maxVal) * 100}%`, background: "var(--accent)" }}
                  />
                </div>
                <span className="text-xs font-data" style={{ color: "var(--shell-text)" }}>{(f.value * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
          <h3 className="mb-2 text-xs font-semibold uppercase" style={{ color: "var(--shell-text)" }}>Data sources & freshness</h3>
          <ul className="mb-6 space-y-1 text-sm" style={{ color: "var(--content-text-secondary)" }}>
            {mlTransparency.dataSources.map((s) => (
              <li key={s.name}>{s.name}: {s.lastUpdated}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--shell-text)" }}>
            <span>Model: {mlTransparency.modelVersion}</span>
            <span>Training samples: {mlTransparency.trainingSamples.toLocaleString()}</span>
            <span>Accuracy: {mlTransparency.accuracyPct}%</span>
          </div>
        </div>
      )}
    </section>
  );
}

export default function CountryAnalysisView() {
  const params = useParams();
  const { scenario } = useScenario();
  const code = typeof params?.code === "string" ? params.code : "";
  const data = useMemo(() => getCountryAnalysis(code, scenario), [code, scenario]);

  if (!data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
        <AlertTriangle size={48} style={{ color: "var(--shell-text)" }} />
        <h2 className="text-xl font-semibold" style={{ color: "var(--content-text)" }}>Country not found</h2>
        <p className="text-sm" style={{ color: "var(--content-text-secondary)" }}>
          No analysis for code &quot;{code}&quot; in the current scenario. Try a country from your watchlist.
        </p>
        <Link
          href="/dashboard"
          className="rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 pb-12">
      <HeroSection data={data} />
      <IntelligenceBriefSection data={data} />
      <CausalChainSection data={data} />
      <RiskForecastChartSection data={data} />
      <HeadlinesAndEventsSection data={data} />
      <AssetsAtRiskSection data={data} />
      <MLTransparencySection data={data} />
    </div>
  );
}
