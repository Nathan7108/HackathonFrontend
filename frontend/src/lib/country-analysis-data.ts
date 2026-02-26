/**
 * Country analysis mock data — replace with API calls later.
 * getCountryAnalysis(code, scenario) returns full page data for /country/[code].
 */

import type { CausalStep, HeadlineWithSentiment, ACLEvent, AssetAtRisk } from "./types";
import type { DemoScenario, MockCountry } from "./mock-data";
import { AVAILABLE_COUNTRIES } from "./mock-data";

export interface CountryAnalysisData {
  country: MockCountry;
  intelligenceBrief: string;
  keyFactors: string[];
  industriesExposed: string[];
  causalChain: CausalStep[];
  forecast: {
    trend: "ESCALATING" | "STABLE" | "DE-ESCALATING";
    current: number;
    day30: number;
    day60: number;
    day90: number;
    history: number[]; // 90 days
    forecastSeries: number[]; // 90 days
    confidenceLower: number[];
    confidenceUpper: number[];
  };
  headlines: HeadlineWithSentiment[];
  acledEvents: ACLEvent[];
  assetsAtRisk: AssetAtRisk[];
  mlTransparency: {
    featureImportance: { name: string; value: number }[];
    dataSources: { name: string; lastUpdated: string }[];
    modelVersion: string;
    trainingSamples: number;
    accuracyPct: number;
  };
  lastUpdated: string;
  modelConfidence: number;
  acledEventsThisMonth: number;
  headlineSentimentPct: number;
  anomalyStatus: string;
  lstmForecastDirection: string;
}

// Iraq (IQ) — full demo causal chain (Meridian Energy focus)
const IRAQ_CAUSAL_CHAIN: CausalStep[] = [
  {
    step: 1,
    title: "Signal Detection",
    description: "GDELT Goldstein score dropped -3.2σ below baseline. Event volume in southern governorates 2.1x 90-day average.",
    confidence: 94,
    dataSource: "GDELT",
  },
  {
    step: 2,
    title: "Pattern Match",
    description: "Matches pre-escalation pattern seen in Iraq 2014 (ISIS push), Yemen 2015 (Houthi takeover). LSTM similarity 0.87.",
    confidence: 89,
    dataSource: "LSTM",
  },
  {
    step: 3,
    title: "Actor Identification",
    description: "Iranian-backed militia groups (Kata'ib Hezbollah, Asa'ib Ahl al-Haq), Iraqi Security Forces, Kurdish Peshmerga. ACLED actor codes aligned.",
    confidence: 91,
    dataSource: "ACLED",
  },
  {
    step: 4,
    title: "Economic Trigger",
    description: "Oil exports from Basra dropped 12% WoW. FDI outflows accelerating. FinBERT sentiment on economy -0.82.",
    confidence: 86,
    dataSource: "FinBERT",
  },
  {
    step: 5,
    title: "Escalation Indicator",
    description: "Civilian displacement up 340% (UCDP). Media negativity index peaked at 94th percentile. Battle events +67% vs prior 30d.",
    confidence: 92,
    dataSource: "UCDP",
  },
  {
    step: 6,
    title: "Impact Projection",
    description: "85% probability of sustained conflict within 60 days. Basra corridor refinery operations at elevated interruption risk.",
    confidence: 88,
    dataSource: "Sentinel",
  },
  {
    step: 7,
    title: "Recommended Action",
    description: "Evacuate non-essential Basra personnel; hedge oil futures exposure; activate alternate export route playbook.",
    confidence: 90,
    dataSource: "Sentinel",
  },
];

// Taiwan (TW) — Pacific Semiconductor
const TAIWAN_CAUSAL_CHAIN: CausalStep[] = [
  {
    step: 1,
    title: "Signal Detection",
    description: "GDELT military cooperation and conflict tone 4.1σ above baseline. Taiwan Strait event count highest since Aug 2024.",
    confidence: 96,
    dataSource: "GDELT",
  },
  {
    step: 2,
    title: "Pattern Match",
    description: "Matches pre-crisis pattern: Pelosi visit 2022, April 2024 drills. LSTM escalation trajectory 0.91 similarity.",
    confidence: 90,
    dataSource: "LSTM",
  },
  {
    step: 3,
    title: "Actor Identification",
    description: "PLA Navy and Air Force, ROC armed forces. US carrier group repositioning. ACLED cross-strait military events.",
    confidence: 93,
    dataSource: "ACLED",
  },
  {
    step: 4,
    title: "Economic Trigger",
    description: "China rare earth export controls expanded to 17 elements. TSMC diversification announcement. Supply chain sentiment -0.71.",
    confidence: 88,
    dataSource: "FinBERT",
  },
  {
    step: 5,
    title: "Escalation Indicator",
    description: "71 aircraft + 14 naval vessels in single exercise. GDELT escalatory language 89th percentile. No de-escalation signals.",
    confidence: 94,
    dataSource: "GDELT",
  },
  {
    step: 6,
    title: "Impact Projection",
    description: "78% probability of supply disruption to advanced nodes within 90 days. Fab allocation delays likely in 30 days.",
    confidence: 85,
    dataSource: "Sentinel",
  },
  {
    step: 7,
    title: "Recommended Action",
    description: "Activate secondary supplier agreements (Samsung, GlobalFoundries). Extend rare earth inventory to 90-day buffer.",
    confidence: 89,
    dataSource: "Sentinel",
  },
];

// Yemen (YE) — Atlas Logistics
const YEMEN_CAUSAL_CHAIN: CausalStep[] = [
  {
    step: 1,
    title: "Signal Detection",
    description: "ACLED anti-ship and explosion events 5.8σ above baseline. Red Sea corridor event frequency 40% up MoM.",
    confidence: 97,
    dataSource: "ACLED",
  },
  {
    step: 2,
    title: "Pattern Match",
    description: "Matches maritime chokepoint crisis pattern. Historical analog: Strait of Hormuz 2019. LSTM 0.89.",
    confidence: 88,
    dataSource: "LSTM",
  },
  {
    step: 3,
    title: "Actor Identification",
    description: "Houthi forces (Ansar Allah), US CENTCOM, coalition naval assets. ACLED actor and event type codes aligned.",
    confidence: 92,
    dataSource: "ACLED",
  },
  {
    step: 4,
    title: "Economic Trigger",
    description: "War risk insurance premiums +400% for Red Sea transit. Suez revenue collapse. FinBERT shipping sentiment -0.91.",
    confidence: 90,
    dataSource: "FinBERT",
  },
  {
    step: 5,
    title: "Escalation Indicator",
    description: "80% of major carriers rerouting via Cape. Hodeidah port strikes. Fatality count in corridor up 3x.",
    confidence: 93,
    dataSource: "UCDP",
  },
  {
    step: 6,
    title: "Impact Projection",
    description: "Red Sea corridor effectively closed to unescorted vessels for 90+ days. Cape transit +10–14 days, +$1M/voyage.",
    confidence: 91,
    dataSource: "Sentinel",
  },
  {
    step: 7,
    title: "Recommended Action",
    description: "Pre-position inventory at European ports; lock long-haul rates; avoid Red Sea routing for non-essential cargo.",
    confidence: 87,
    dataSource: "Sentinel",
  },
];

const CAUSAL_CHAINS: Record<string, CausalStep[]> = {
  IQ: IRAQ_CAUSAL_CHAIN,
  TW: TAIWAN_CAUSAL_CHAIN,
  YE: YEMEN_CAUSAL_CHAIN,
};

function defaultCausalChain(code: string): CausalStep[] {
  const chain = CAUSAL_CHAINS[code];
  if (chain) return chain;
  return [
    { step: 1, title: "Signal Detection", description: "ML model detected anomaly in event stream.", confidence: 85, dataSource: "GDELT" },
    { step: 2, title: "Pattern Match", description: "Historical pattern match in progress.", confidence: 80, dataSource: "LSTM" },
    { step: 3, title: "Actor Identification", description: "Actors being identified from ACLED/UCDP.", confidence: 82, dataSource: "ACLED" },
    { step: 4, title: "Economic Trigger", description: "Economic indicators under analysis.", confidence: 78, dataSource: "FinBERT" },
    { step: 5, title: "Escalation Indicator", description: "Escalation metrics being computed.", confidence: 81, dataSource: "UCDP" },
    { step: 6, title: "Impact Projection", description: "Impact projection pending full run.", confidence: 79, dataSource: "Sentinel" },
    { step: 7, title: "Recommended Action", description: "Recommendations will be tailored to your scenario.", confidence: 83, dataSource: "Sentinel" },
  ];
}

function buildForecastSeries(country: MockCountry): CountryAnalysisData["forecast"] {
  const spark = country.sparkline;
  const current = country.riskScore;
  const day30 = country.forecast30d;
  const day60 = Math.round(day30 + (day30 - current) * 0.5);
  const day90 = Math.round(day60 + (day60 - day30) * 0.3);
  const history = spark.slice(-90) as number[];
  while (history.length < 90) history.unshift(history[0] ?? current);
  const forecastSeries = [
    current,
    ...Array.from({ length: 29 }, (_, i) => Math.round(current + ((day30 - current) * (i + 1)) / 30)),
    ...Array.from({ length: 30 }, (_, i) => Math.round(day30 + ((day60 - day30) * (i + 1)) / 30)),
    ...Array.from({ length: 29 }, (_, i) => Math.round(day60 + ((day90 - day60) * (i + 1)) / 30)),
  ];
  const band = 4;
  const confidenceLower = forecastSeries.map((v) => Math.max(0, v - band));
  const confidenceUpper = forecastSeries.map((v) => Math.min(100, v + band));
  return {
    trend: country.trend,
    current,
    day30,
    day60,
    day90,
    history,
    forecastSeries,
    confidenceLower,
    confidenceUpper,
  };
}

function buildHeadlines(country: MockCountry): HeadlineWithSentiment[] {
  return country.headlines.slice(0, 6).map((title, i) => ({
    id: `h-${country.code}-${i}`,
    title,
    sentiment: country.sentiment < -0.5 ? "NEGATIVE" : country.sentiment > 0.2 ? "POSITIVE" : "NEUTRAL",
    confidence: Math.round(85 + Math.random() * 12),
    date: `${i + 1}d ago`,
  }));
}

function buildACLEDEvents(country: MockCountry): ACLEvent[] {
  const types: ACLEvent["type"][] = ["Battle", "Explosion", "Protest", "Violence against civilians"];
  return [
    { id: "e1", type: "Battle", fatalities: 12, location: "Basra Governorate", lat: country.latitude + 0.1, lon: country.longitude + 0.1, date: "2 days ago" },
    { id: "e2", type: "Explosion", fatalities: 3, location: "Baghdad", lat: country.latitude - 0.2, lon: country.longitude + 0.05, date: "3 days ago" },
    { id: "e3", type: "Protest", location: "Nasiriyah", lat: country.latitude, lon: country.longitude - 0.15, date: "5 days ago" },
    { id: "e4", type: "Violence against civilians", fatalities: 7, location: "Kirkuk", lat: country.latitude + 0.3, lon: country.longitude - 0.2, date: "1 week ago" },
  ];
}

// Which scenario asset labels belong to which country (substring match)
const ASSET_COUNTRY_HINTS: Record<string, string[]> = {
  IQ: ["Basra", "Rumaila", "Baghdad"],
  TW: ["TSMC", "Taiwan", "Tainan"],
  YE: ["Hodeidah", "Yemen", "Red Sea"],
  EG: ["Port Said", "Suez", "Cairo"],
  SA: ["Yanbu", "Saudi"],
  NG: ["Warri", "Niger Delta", "Nigeria"],
  KZ: ["Tengiz", "Kazakhstan", "CPC"],
  UA: ["Odesa", "Ukraine", "Black Sea"],
  SO: ["Mogadishu", "Somalia"],
  PA: ["Panama", "Balboa"],
  IR: ["Hormuz", "Iran"],
};

const ASSET_TYPE_MAP: Record<string, AssetAtRisk["type"]> = {
  facility: "Facility",
  port: "Port",
  office: "Office",
  supplier: "Supplier",
  "route-point": "Port",
};

function buildAssetsForCountry(scenario: DemoScenario, countryCode: string): AssetAtRisk[] {
  const hints = ASSET_COUNTRY_HINTS[countryCode];
  if (!hints) return [];
  const matched = scenario.assets.filter((a) => hints.some((h) => a.label.includes(h)));
  const exposureMap: Record<string, AssetAtRisk["riskExposure"]> = {
    "40km from active militia zone": "HIGH",
    "Inside conflict perimeter": "CRITICAL",
    "Within PLA exercise zone": "CRITICAL",
    "Active missile threat zone": "CRITICAL",
    "Pipeline sabotage zone": "HIGH",
    "Export control target": "HIGH",
    "Houthi drone range": "ELEVATED",
  };
  return matched.map((a, i) => ({
    id: a.id,
    name: a.label,
    type: ASSET_TYPE_MAP[a.type] ?? "Facility",
    distanceFromConflict: a.risk ?? "—",
    riskExposure: ((a.risk && exposureMap[a.risk]) as AssetAtRisk["riskExposure"]) ?? "ELEVATED",
    recommendedAction: a.detail?.split("—")[0]?.trim() ?? "Monitor; review contingency plan",
    lat: a.latitude,
    lon: a.longitude,
  }));
}

const FEATURE_IMPORTANCE = [
  { name: "acled_battle_count_30d", value: 0.18 },
  { name: "gdelt_goldstein_7d_ma", value: 0.14 },
  { name: "finbert_negative_score", value: 0.12 },
  { name: "ucdp_fatalities_90d", value: 0.11 },
  { name: "gdelt_event_volume_sigma", value: 0.10 },
  { name: "acled_civilian_violence", value: 0.09 },
  { name: "lstm_escalation_score", value: 0.08 },
  { name: "acled_protest_count", value: 0.07 },
  { name: "gdelt_actor_tone", value: 0.06 },
  { name: "economic_sanctions_index", value: 0.05 },
];

const DATA_SOURCES = [
  { name: "GDELT", lastUpdated: "15 min ago" },
  { name: "ACLED", lastUpdated: "3 days ago" },
  { name: "UCDP", lastUpdated: "1 week ago" },
  { name: "FinBERT", lastUpdated: "2 hours ago" },
  { name: "LSTM forecast", lastUpdated: "1 hour ago" },
  { name: "Sentinel XGBoost", lastUpdated: "2 min ago" },
];

export function getCountryAnalysis(code: string, scenario: DemoScenario): CountryAnalysisData | null {
  const upper = code.toUpperCase();
  const country =
    scenario.countries.find((c) => c.code === upper) ??
    AVAILABLE_COUNTRIES.find((c) => c.code === upper);
  if (!country) return null;

  const forecast = buildForecastSeries(country);
  const causalChain = defaultCausalChain(upper);

  const intelligenceBriefs: Record<string, string> = {
    IQ: "Iraq has crossed into CRITICAL risk territory. Our anomaly detector flagged a **3.2 standard deviation** spike in militia activity near **Basra** — the highest reading since the 2019 embassy crisis. **Parliament's budget deadlock** is eroding central government authority in southern oil-producing provinces. The convergence of **Iranian-backed militia** escalation, political paralysis, and **infrastructure targeting** creates acute risk for energy operations in the Basra corridor. GDELT Goldstein scores and ACLED battle event counts both indicate sustained escalation trajectory with no near-term de-escalation signals.",
    TW: "Taiwan Strait tensions have reached their highest level since August 2024. **PLA exercises** involving 71 aircraft and 14 naval vessels are the largest since the Pelosi visit response. Our anomaly detector registered a **4.1σ spike** — the strongest signal in our Taiwan dataset. **TSMC's emergency diversification** announcement suggests the company's own risk models are flashing red. Combined with **China's rare earth export controls** targeting semiconductor inputs, the supply chain disruption risk is severe and compounding.",
    YE: "The **Red Sea shipping corridor** is in crisis. Houthi **anti-ship missile strikes** have increased 40% this month, with our anomaly detector registering a **5.8σ deviation** — the most extreme reading in any country this quarter. Major shipping lines have **rerouted 80% of vessels** around the Cape of Good Hope. Combined with the **Strait of Hormuz** tanker seizure by Iran, the two most critical maritime chokepoints for global trade are simultaneously under threat.",
  };

  const keyFactorsByCountry: Record<string, string[]> = {
    IQ: [
      "Militia activity 3.2σ above baseline in Basra governorate",
      "Parliament budget deadlock weakening central authority",
      "Oil export volume down 12% WoW from Basra",
      "Civilian displacement +340% (UCDP); media negativity at peak",
    ],
    TW: [
      "PLA exercise scale 4.1σ above baseline; no de-escalation signals",
      "Rare earth export controls expanded to 17 elements",
      "TSMC diversification signals internal risk assessment",
      "US carrier repositioning; cross-strait event count at record",
    ],
    YE: [
      "Anti-ship events 5.8σ above baseline; Red Sea corridor degraded",
      "80% of major carriers rerouting via Cape of Good Hope",
      "War risk insurance +400%; Hodeidah port under active threat",
      "Iran Hormuz seizure compounds chokepoint risk",
    ],
  };

  const industriesByScenario: Record<string, string[]> = {
    meridian: ["Energy", "Shipping", "Defense"],
    pacific: ["Tech", "Semiconductors", "Defense"],
    atlas: ["Shipping", "Energy", "Logistics"],
  };

  return {
    country,
    intelligenceBrief: intelligenceBriefs[upper] ?? `Risk analysis for ${country.name}. Anomaly and event-based indicators are being monitored. Key actors and economic triggers are under assessment.`,
    keyFactors: keyFactorsByCountry[upper] ?? ["Anomaly detected", "Event volume elevated", "Sentiment negative", "Forecast escalating"],
    industriesExposed: industriesByScenario[scenario.id] ?? ["Energy", "Shipping", "Defense"],
    causalChain,
    forecast,
    headlines: buildHeadlines(country),
    acledEvents: buildACLEDEvents(country),
    assetsAtRisk: buildAssetsForCountry(scenario, upper),
    mlTransparency: {
      featureImportance: FEATURE_IMPORTANCE,
      dataSources: DATA_SOURCES,
      modelVersion: "XGBoost v2.4 / LSTM seq-90",
      trainingSamples: 1_200_000,
      accuracyPct: 98,
    },
    lastUpdated: "2 min ago",
    modelConfidence: 89,
    acledEventsThisMonth: 47,
    headlineSentimentPct: -72,
    anomalyStatus: country.anomaly ? "Anomaly detected" : "Within baseline",
    lstmForecastDirection: country.trend === "ESCALATING" ? "↑ Escalating" : country.trend === "DE-ESCALATING" ? "↓ De-escalating" : "— Stable",
  };
}
