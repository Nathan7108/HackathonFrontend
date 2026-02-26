// src/lib/mock-data.ts

export type RiskLevel = "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";

export interface MockCountry {
  code: string;
  name: string;
  riskScore: number;
  riskLevel: RiskLevel;
  trend: "ESCALATING" | "STABLE" | "DE-ESCALATING";
  changePercent: number;
  anomaly: boolean;
  headlines: string[];
  latitude: number;
  longitude: number;
  sparkline: number[];
  sentiment: number;
  forecast30d: number;
  volatility: "HIGH" | "MED" | "LOW";
}

export interface MockAlert {
  id: string;
  timestamp: string;
  country: string;
  countryCode: string;
  type: "ANOMALY" | "ESCALATION" | "THRESHOLD" | "FORECAST";
  severity: "HIGH" | "MED" | "LOW";
  message: string;
}

export interface MockBrief {
  country: string;
  countryCode: string;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  topDrivers: string[];
  industry: string;
}

export interface MockForecast {
  country: string;
  countryCode: string;
  current: number;
  day30: number;
  day60: number;
  day90: number;
  trend: "ESCALATING" | "STABLE" | "DE-ESCALATING";
  sparkline: number[];
}

export interface CustomerAsset {
  id: string;
  type: "facility" | "port" | "route-point" | "supplier" | "office";
  label: string;
  latitude: number;
  longitude: number;
  detail: string;
  risk?: string;
}

export interface TradeRoute {
  id: string;
  label: string;
  color: string;
  points: [number, number][];
}

export interface DemoScenario {
  id: string;
  name: string;
  industry: string;
  icon: string;
  description: string;
  gti: number;
  gtiLevel: RiskLevel;
  countries: MockCountry[];
  alerts: MockAlert[];
  brief: MockBrief;
  forecast: MockForecast;
  modelHealth: {
    accuracy: number;
    features: number;
    countries: number;
    sources: number;
    lastTrained: string;
  };
  assets: CustomerAsset[];
  routes: TradeRoute[];
}

// ─────────────────────────────────────────────
// SCENARIO 1: MERIDIAN ENERGY CORP (Oil & Gas)
// ─────────────────────────────────────────────
const meridianEnergy: DemoScenario = {
  id: "meridian",
  name: "Meridian Energy Corp",
  industry: "Oil & Gas",
  icon: "🛢️",
  description: "Global upstream & midstream operations across MENA and Central Asia",
  gti: 72,
  gtiLevel: "HIGH",
  countries: [
    {
      code: "IQ", name: "Iraq", riskScore: 81, riskLevel: "CRITICAL",
      trend: "ESCALATING", changePercent: 12, anomaly: true,
      headlines: [
        "Militia attacks on Basra oil infrastructure intensify",
        "Iraq parliament delays budget vote amid sectarian tensions",
        "Iranian-backed groups expand control in southern provinces"
      ],
      latitude: 33.3, longitude: 44.4,
      sparkline: [58, 61, 63, 65, 68, 72, 74, 76, 78, 79, 80, 81], sentiment: -0.82, forecast30d: 85, volatility: "HIGH",
    },
    {
      code: "IR", name: "Iran", riskScore: 78, riskLevel: "HIGH",
      trend: "ESCALATING", changePercent: 8, anomaly: true,
      headlines: [
        "IAEA reports Iran enrichment at 84% — weapons-grade threshold",
        "Strait of Hormuz military exercises enter second week",
        "EU sanctions package targets Iranian petrochemical sector"
      ],
      latitude: 32.4, longitude: 53.7,
      sparkline: [62, 63, 65, 64, 68, 70, 72, 73, 75, 76, 77, 78], sentiment: -0.76, forecast30d: 82, volatility: "HIGH",
    },
    {
      code: "LY", name: "Libya", riskScore: 74, riskLevel: "HIGH",
      trend: "STABLE", changePercent: -2, anomaly: false,
      headlines: [
        "Eastern government blocks oil exports from Sirte basin",
        "UN envoy warns of deteriorating ceasefire conditions",
        "Turkish military presence in Tripoli expanded"
      ],
      latitude: 26.3, longitude: 17.2,
      sparkline: [70, 72, 74, 76, 75, 74, 73, 74, 75, 74, 74, 74], sentiment: -0.45, forecast30d: 72, volatility: "MED",
    },
    {
      code: "NG", name: "Nigeria", riskScore: 67, riskLevel: "ELEVATED",
      trend: "ESCALATING", changePercent: 15, anomaly: true,
      headlines: [
        "Niger Delta pipeline sabotage cuts output by 200k barrels/day",
        "Boko Haram offshoot attacks military convoy in northeast",
        "Naira hits record low as inflation exceeds 30%"
      ],
      latitude: 9.1, longitude: 7.5,
      sparkline: [48, 50, 52, 51, 53, 56, 58, 60, 62, 64, 66, 67], sentiment: -0.68, forecast30d: 72, volatility: "HIGH",
    },
    {
      code: "KZ", name: "Kazakhstan", riskScore: 52, riskLevel: "ELEVATED",
      trend: "ESCALATING", changePercent: 18, anomaly: false,
      headlines: [
        "Worker protests spread to Tengiz oil field operations",
        "Russia pressures Astana over CPC pipeline transit fees",
        "Opposition crackdown draws EU sanctions threat"
      ],
      latitude: 48.0, longitude: 68.0,
      sparkline: [32, 33, 34, 35, 38, 40, 42, 44, 46, 48, 50, 52], sentiment: -0.52, forecast30d: 58, volatility: "MED",
    },
    {
      code: "SA", name: "Saudi Arabia", riskScore: 38, riskLevel: "MODERATE",
      trend: "STABLE", changePercent: -3, anomaly: false,
      headlines: [
        "OPEC+ production cuts extended through Q3",
        "Houthi drone attacks intercepted near Yanbu terminal",
        "Saudi-Iran diplomatic channel holds despite regional tensions"
      ],
      latitude: 23.9, longitude: 45.1,
      sparkline: [42, 41, 40, 40, 39, 39, 38, 38, 38, 38, 38, 38], sentiment: 0.15, forecast30d: 36, volatility: "LOW",
    },
    {
      code: "AE", name: "UAE", riskScore: 22, riskLevel: "LOW",
      trend: "DE-ESCALATING", changePercent: -7, anomaly: false,
      headlines: [
        "Abu Dhabi expands strategic petroleum reserve capacity",
        "UAE mediates backchannel talks between regional rivals",
        "Dubai energy trading hub reports record volumes"
      ],
      latitude: 23.4, longitude: 53.8,
      sparkline: [30, 29, 28, 27, 26, 25, 24, 23, 23, 22, 22, 22], sentiment: 0.42, forecast30d: 20, volatility: "LOW",
    },
  ],
  alerts: [
    { id: "a1", timestamp: "14 min ago", country: "Iraq", countryCode: "IQ", type: "ANOMALY", severity: "HIGH", message: "Anomaly detected: Iraq event frequency 3.2σ above baseline. Militia activity near Basra refinery zone." },
    { id: "a2", timestamp: "47 min ago", country: "Iran", countryCode: "IR", type: "ESCALATION", severity: "HIGH", message: "Iran risk score crossed HIGH threshold (78). Hormuz military exercises and IAEA enrichment report driving escalation." },
    { id: "a3", timestamp: "1 hr ago", country: "Nigeria", countryCode: "NG", type: "ANOMALY", severity: "HIGH", message: "Anomaly detected: Nigeria protest events accelerating 2.8x vs 90-day baseline." },
    { id: "a4", timestamp: "2 hr ago", country: "Kazakhstan", countryCode: "KZ", type: "ESCALATION", severity: "MED", message: "Kazakhstan risk trending +18% over 30 days. Tengiz oil field labor unrest expanding." },
    { id: "a5", timestamp: "3 hr ago", country: "Libya", countryCode: "LY", type: "THRESHOLD", severity: "MED", message: "Libya oil export blockade entering day 12. Risk score holding at 74." },
    { id: "a6", timestamp: "5 hr ago", country: "Saudi Arabia", countryCode: "SA", type: "FORECAST", severity: "LOW", message: "30-day forecast: Saudi Arabia risk stable at MODERATE. Houthi threat contained." },
  ],
  brief: {
    country: "Iraq", countryCode: "IQ", riskScore: 81, riskLevel: "CRITICAL",
    summary: "Iraq has crossed into CRITICAL risk territory. Our anomaly detector flagged a 3.2 standard deviation spike in militia activity near Basra — the highest reading since the 2019 embassy crisis. Simultaneously, parliament's budget deadlock is eroding central government authority in southern oil-producing provinces. The convergence of armed group escalation, political paralysis, and infrastructure targeting creates acute risk for energy operations in the Basra corridor.",
    topDrivers: ["acled_battle_count", "gdelt_event_acceleration", "acled_civilian_violence"],
    industry: "Direct threat to Basra refinery operations. Pipeline infrastructure in Rumaila field within 40km of active militia operations. Recommend elevated security posture and contingency evacuation planning for non-essential personnel.",
  },
  forecast: {
    country: "Iraq", countryCode: "IQ", current: 81, day30: 85, day60: 88, day90: 84,
    trend: "ESCALATING",
    sparkline: [58, 61, 63, 60, 65, 68, 72, 71, 74, 78, 80, 81],
  },
  modelHealth: {
    accuracy: 98, features: 47, countries: 201, sources: 6, lastTrained: "2 hours ago",
  },
  assets: [
    { id: "m1", type: "facility", label: "Basra Refinery", latitude: 30.5, longitude: 47.8, detail: "Primary refining facility — 200k bpd capacity", risk: "40km from active militia zone" },
    { id: "m2", type: "facility", label: "Rumaila Field Ops", latitude: 30.3, longitude: 47.3, detail: "Upstream operations center", risk: "Inside conflict perimeter" },
    { id: "m3", type: "facility", label: "Tengiz Pipeline Hub", latitude: 46.2, longitude: 53.2, detail: "CPC pipeline connection point", risk: "Worker protests within 10km" },
    { id: "m4", type: "office", label: "Dubai HQ", latitude: 25.2, longitude: 55.3, detail: "Regional headquarters and trading desk" },
    { id: "m5", type: "port", label: "Yanbu Terminal", latitude: 24.1, longitude: 38.1, detail: "Export terminal — Red Sea access", risk: "Houthi drone range" },
    { id: "m6", type: "supplier", label: "Warri Depot", latitude: 5.5, longitude: 5.7, detail: "Niger Delta supply depot", risk: "Pipeline sabotage zone" },
  ],
  routes: [
    { id: "r1", label: "Persian Gulf Export", color: "#ef4444", points: [[47.8, 30.5], [50.5, 26.5], [54.0, 25.0], [56.5, 25.2]] },
    { id: "r2", label: "CPC Pipeline", color: "#f97316", points: [[47.3, 30.3], [50.0, 35.0], [53.2, 46.2], [55.0, 48.0]] },
    { id: "r3", label: "Red Sea Shipping", color: "#eab308", points: [[38.1, 24.1], [40.0, 18.0], [43.0, 14.0], [45.0, 12.5]] },
  ],
};

// ─────────────────────────────────────────────
// SCENARIO 2: PACIFIC SEMICONDUCTOR (Tech)
// ─────────────────────────────────────────────
const pacificSemiconductor: DemoScenario = {
  id: "pacific",
  name: "Pacific Semiconductor",
  industry: "Tech / Manufacturing",
  icon: "🔬",
  description: "Fabless chip designer with suppliers across East Asia and Europe",
  gti: 67,
  gtiLevel: "ELEVATED",
  countries: [
    {
      code: "TW", name: "Taiwan", riskScore: 73, riskLevel: "HIGH",
      trend: "ESCALATING", changePercent: 9, anomaly: true,
      headlines: [
        "PLA conducts largest Taiwan Strait exercises since 2024",
        "TSMC announces emergency fab diversification to Arizona",
        "US carrier group repositions to Western Pacific"
      ],
      latitude: 23.7, longitude: 121.0,
      sparkline: [45, 48, 50, 52, 55, 58, 62, 65, 68, 70, 72, 73], sentiment: -0.71, forecast30d: 78, volatility: "HIGH",
    },
    {
      code: "CN", name: "China", riskScore: 64, riskLevel: "ELEVATED",
      trend: "ESCALATING", changePercent: 6, anomaly: false,
      headlines: [
        "Beijing expands rare earth export controls to 17 elements",
        "South China Sea confrontation with Philippine vessels",
        "Tech sector regulation wave continues with new AI rules"
      ],
      latitude: 35.9, longitude: 104.2,
      sparkline: [55, 56, 57, 58, 59, 60, 61, 62, 62, 63, 63, 64], sentiment: -0.58, forecast30d: 68, volatility: "MED",
    },
    {
      code: "KR", name: "South Korea", riskScore: 45, riskLevel: "ELEVATED",
      trend: "STABLE", changePercent: 2, anomaly: false,
      headlines: [
        "Samsung accelerates HBM production amid AI chip demand",
        "North Korea missile test prompts joint military drills",
        "Political crisis: opposition pushes new impeachment vote"
      ],
      latitude: 35.9, longitude: 127.8,
      sparkline: [42, 43, 43, 44, 44, 45, 45, 45, 44, 45, 45, 45], sentiment: -0.22, forecast30d: 46, volatility: "LOW",
    },
    {
      code: "JP", name: "Japan", riskScore: 28, riskLevel: "MODERATE",
      trend: "STABLE", changePercent: -1, anomaly: false,
      headlines: [
        "Japan doubles defense budget citing China, North Korea threats",
        "Rapidus chip fab construction on track in Hokkaido",
        "Yen weakness pressures semiconductor import costs"
      ],
      latitude: 36.2, longitude: 138.3,
      sparkline: [30, 30, 29, 29, 28, 28, 28, 28, 28, 28, 28, 28], sentiment: 0.18, forecast30d: 27, volatility: "LOW",
    },
    {
      code: "NL", name: "Netherlands", riskScore: 18, riskLevel: "LOW",
      trend: "STABLE", changePercent: 0, anomaly: false,
      headlines: [
        "ASML export restrictions to China tighten under US pressure",
        "Dutch government reaffirms tech sovereignty policy",
        "EU Chips Act funding allocated for Eindhoven expansion"
      ],
      latitude: 52.1, longitude: 5.3,
      sparkline: [20, 19, 19, 18, 18, 18, 18, 18, 18, 18, 18, 18], sentiment: 0.35, forecast30d: 17, volatility: "LOW",
    },
    {
      code: "VN", name: "Vietnam", riskScore: 35, riskLevel: "MODERATE",
      trend: "DE-ESCALATING", changePercent: -4, anomaly: false,
      headlines: [
        "Intel fab expansion in Ho Chi Minh City breaks ground",
        "Vietnam-China border trade normalized after dispute",
        "Anti-corruption campaign stabilizes foreign investor confidence"
      ],
      latitude: 14.1, longitude: 108.3,
      sparkline: [40, 39, 38, 38, 37, 37, 36, 36, 35, 35, 35, 35], sentiment: 0.25, forecast30d: 33, volatility: "LOW",
    },
  ],
  alerts: [
    { id: "a1", timestamp: "8 min ago", country: "Taiwan", countryCode: "TW", type: "ANOMALY", severity: "HIGH", message: "Anomaly detected: Taiwan military event frequency 4.1σ above baseline. PLA exercises unprecedented in scale." },
    { id: "a2", timestamp: "1 hr ago", country: "China", countryCode: "CN", type: "ESCALATION", severity: "HIGH", message: "China expands rare earth export controls. Direct supply chain impact on semiconductor manufacturing." },
    { id: "a3", timestamp: "3 hr ago", country: "South Korea", countryCode: "KR", type: "THRESHOLD", severity: "MED", message: "South Korea political instability rising. Opposition impeachment push could disrupt Samsung subsidy programs." },
    { id: "a4", timestamp: "6 hr ago", country: "Taiwan", countryCode: "TW", type: "FORECAST", severity: "HIGH", message: "90-day forecast: Taiwan risk trajectory ESCALATING to 82. Cross-strait tensions show no de-escalation signals." },
  ],
  brief: {
    country: "Taiwan", countryCode: "TW", riskScore: 73, riskLevel: "HIGH",
    summary: "Taiwan Strait tensions have reached their highest level since August 2024. PLA exercises involving 71 aircraft and 14 naval vessels are the largest since the Pelosi visit response. Our anomaly detector registered a 4.1σ spike — the strongest signal in our Taiwan dataset. TSMC's emergency diversification announcement suggests the company's own risk models are flashing red. Combined with China's rare earth export controls targeting semiconductor inputs, the supply chain disruption risk is severe and compounding.",
    topDrivers: ["gdelt_event_acceleration", "acled_battle_count", "finbert_negative_score"],
    industry: "Critical exposure: 67% of advanced chip fabrication depends on Taiwan. TSMC allocation delays likely within 30 days. Recommend activating secondary supplier agreements with Samsung Foundry and GlobalFoundries. Rare earth component inventory should be extended to 90-day buffer.",
  },
  forecast: {
    country: "Taiwan", countryCode: "TW", current: 73, day30: 78, day60: 82, day90: 79,
    trend: "ESCALATING",
    sparkline: [45, 48, 50, 52, 55, 58, 62, 65, 68, 70, 72, 73],
  },
  modelHealth: {
    accuracy: 98, features: 47, countries: 201, sources: 6, lastTrained: "2 hours ago",
  },
  assets: [
    { id: "p1", type: "facility", label: "TSMC Fab 18", latitude: 24.8, longitude: 120.9, detail: "Primary 3nm supplier — Tainan Science Park", risk: "Within PLA exercise zone" },
    { id: "p2", type: "facility", label: "Samsung Pyeongtaek", latitude: 37.0, longitude: 127.1, detail: "Secondary HBM supplier" },
    { id: "p3", type: "supplier", label: "ASML Veldhoven", latitude: 51.4, longitude: 5.5, detail: "EUV lithography supplier — sole source" },
    { id: "p4", type: "facility", label: "Rapidus Hokkaido", latitude: 43.1, longitude: 141.3, detail: "2nm R&D facility — strategic backup" },
    { id: "p5", type: "office", label: "HCMC Design Center", latitude: 10.8, longitude: 106.6, detail: "Chip design team — 200 engineers" },
    { id: "p6", type: "supplier", label: "Rare Earth Processing", latitude: 23.1, longitude: 113.3, detail: "Guangzhou rare earth refinery", risk: "Export control target" },
  ],
  routes: [
    { id: "r1", label: "Taiwan-US Shipping", color: "#ef4444", points: [[120.9, 24.8], [125.0, 28.0], [140.0, 35.0], [180.0, 40.0]] },
    { id: "r2", label: "Korea-Taiwan Link", color: "#f97316", points: [[127.1, 37.0], [125.0, 32.0], [122.0, 27.0], [120.9, 24.8]] },
    { id: "r3", label: "ASML Supply Chain", color: "#2563eb", points: [[5.5, 51.4], [30.0, 35.0], [60.0, 25.0], [100.0, 15.0], [120.9, 24.8]] },
  ],
};

// ─────────────────────────────────────────────
// SCENARIO 3: ATLAS GLOBAL LOGISTICS (Shipping)
// ─────────────────────────────────────────────
const atlasLogistics: DemoScenario = {
  id: "atlas",
  name: "Atlas Global Logistics",
  industry: "Shipping & Trade",
  icon: "🚢",
  description: "Container shipping and freight forwarding across major global trade routes",
  gti: 70,
  gtiLevel: "HIGH",
  countries: [
    {
      code: "YE", name: "Yemen", riskScore: 91, riskLevel: "CRITICAL",
      trend: "ESCALATING", changePercent: 5, anomaly: true,
      headlines: [
        "Houthi anti-ship missile strikes increase in Red Sea corridor",
        "US CENTCOM launches retaliatory strikes on Hodeidah port",
        "Major shipping lines divert 80% of vessels around Cape of Good Hope"
      ],
      latitude: 15.6, longitude: 48.5,
      sparkline: [72, 74, 78, 80, 82, 85, 87, 88, 89, 90, 90, 91], sentiment: -0.91, forecast30d: 93, volatility: "HIGH",
    },
    {
      code: "EG", name: "Egypt", riskScore: 62, riskLevel: "ELEVATED",
      trend: "ESCALATING", changePercent: 11, anomaly: false,
      headlines: [
        "Suez Canal revenue drops 40% as ships reroute around Africa",
        "Egyptian military deploys additional forces to Sinai border",
        "IMF loan tranche delayed amid economic reform disputes"
      ],
      latitude: 26.8, longitude: 30.8,
      sparkline: [48, 49, 50, 52, 53, 55, 56, 58, 59, 60, 61, 62], sentiment: -0.55, forecast30d: 66, volatility: "MED",
    },
    {
      code: "SO", name: "Somalia", riskScore: 85, riskLevel: "CRITICAL",
      trend: "STABLE", changePercent: 1, anomaly: false,
      headlines: [
        "Al-Shabaab seizes district near Mogadishu port complex",
        "Piracy incidents rise 300% in Gulf of Aden corridor",
        "African Union withdrawal timeline accelerated"
      ],
      latitude: 5.2, longitude: 46.2,
      sparkline: [82, 83, 84, 84, 85, 85, 85, 85, 85, 85, 85, 85], sentiment: -0.88, forecast30d: 86, volatility: "LOW",
    },
    {
      code: "PA", name: "Panama", riskScore: 41, riskLevel: "ELEVATED",
      trend: "DE-ESCALATING", changePercent: -8, anomaly: false,
      headlines: [
        "Panama Canal draft restrictions easing after rainy season",
        "Daily transit slots increased from 24 to 32 vessels",
        "Government faces protests over mining concession deals"
      ],
      latitude: 8.5, longitude: -80.0,
      sparkline: [52, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 41], sentiment: 0.12, forecast30d: 38, volatility: "MED",
    },
    {
      code: "UA", name: "Ukraine", riskScore: 88, riskLevel: "CRITICAL",
      trend: "STABLE", changePercent: -2, anomaly: false,
      headlines: [
        "Black Sea grain corridor under renewed Russian blockade threat",
        "Ukrainian drone strikes target Russian naval base in Crimea",
        "Odesa port operations continue under air defense umbrella"
      ],
      latitude: 48.4, longitude: 31.2,
      sparkline: [90, 89, 89, 88, 88, 88, 88, 88, 88, 88, 88, 88], sentiment: -0.85, forecast30d: 87, volatility: "LOW",
    },
    {
      code: "SG", name: "Singapore", riskScore: 12, riskLevel: "LOW",
      trend: "STABLE", changePercent: 0, anomaly: false,
      headlines: [
        "Singapore port handles record TEU volume amid diversions",
        "Maritime security patrols expanded in Malacca Strait",
        "New transshipment terminals open ahead of schedule"
      ],
      latitude: 1.4, longitude: 103.8,
      sparkline: [14, 13, 13, 13, 12, 12, 12, 12, 12, 12, 12, 12], sentiment: 0.55, forecast30d: 11, volatility: "LOW",
    },
    {
      code: "IR", name: "Iran", riskScore: 78, riskLevel: "HIGH",
      trend: "ESCALATING", changePercent: 8, anomaly: true,
      headlines: [
        "IRGC Navy seizes commercial tanker near Strait of Hormuz",
        "Insurance premiums for Gulf transit surge 400%",
        "Iran threatens to close Hormuz if sanctions tightened"
      ],
      latitude: 32.4, longitude: 53.7,
      sparkline: [62, 63, 65, 68, 70, 72, 73, 74, 75, 76, 77, 78], sentiment: -0.76, forecast30d: 82, volatility: "HIGH",
    },
  ],
  alerts: [
    { id: "a1", timestamp: "6 min ago", country: "Yemen", countryCode: "YE", type: "ANOMALY", severity: "HIGH", message: "Anomaly detected: Yemen anti-ship missile launches 5.8σ above baseline. Red Sea corridor effectively closed to unescorted vessels." },
    { id: "a2", timestamp: "22 min ago", country: "Iran", countryCode: "IR", type: "ESCALATION", severity: "HIGH", message: "Iran seizes commercial tanker near Hormuz. Third vessel seizure this quarter. Insurance premiums spiking." },
    { id: "a3", timestamp: "1 hr ago", country: "Egypt", countryCode: "EG", type: "THRESHOLD", severity: "MED", message: "Egypt economic risk rising — Suez Canal revenue collapse compounding fiscal stress." },
    { id: "a4", timestamp: "4 hr ago", country: "Somalia", countryCode: "SO", type: "ESCALATION", severity: "HIGH", message: "Gulf of Aden piracy incidents up 300%. Al-Shabaab expanding toward port infrastructure." },
    { id: "a5", timestamp: "8 hr ago", country: "Panama", countryCode: "PA", type: "FORECAST", severity: "LOW", message: "30-day forecast: Panama Canal operations improving. Draft restrictions easing, transit capacity recovering." },
  ],
  brief: {
    country: "Yemen", countryCode: "YE", riskScore: 91, riskLevel: "CRITICAL",
    summary: "The Red Sea shipping corridor is in crisis. Houthi anti-ship missile strikes have increased 40% this month, with our anomaly detector registering a 5.8σ deviation — the most extreme reading in any country this quarter. Major shipping lines have rerouted 80% of vessels around the Cape of Good Hope, adding 10-14 days transit time and $1M+ per voyage in fuel costs. Combined with the Strait of Hormuz tanker seizure by Iran, the two most critical maritime chokepoints for global trade are simultaneously under threat.",
    topDrivers: ["acled_explosion_count", "gdelt_event_acceleration", "acled_fatalities_30d"],
    industry: "Severe disruption to Asia-Europe container routes. Cape of Good Hope rerouting adds $800K-1.2M per voyage. War risk insurance premiums have increased 400% for Red Sea transit. Recommend pre-positioning inventory at European ports and negotiating long-haul rate locks with carriers immediately.",
  },
  forecast: {
    country: "Yemen", countryCode: "YE", current: 91, day30: 93, day60: 90, day90: 86,
    trend: "ESCALATING",
    sparkline: [72, 74, 78, 80, 82, 85, 87, 88, 89, 90, 90, 91],
  },
  modelHealth: {
    accuracy: 98, features: 47, countries: 201, sources: 6, lastTrained: "2 hours ago",
  },
  assets: [
    { id: "a1", type: "port", label: "Port Said Terminal", latitude: 31.3, longitude: 32.3, detail: "Suez Canal entry — container ops", risk: "Revenue collapse from diversions" },
    { id: "a2", type: "port", label: "Hodeidah Port", latitude: 14.8, longitude: 43.0, detail: "Red Sea transit monitoring", risk: "Active missile threat zone" },
    { id: "a3", type: "port", label: "Singapore Hub", latitude: 1.3, longitude: 103.8, detail: "Transshipment mega-hub — record volumes" },
    { id: "a4", type: "port", label: "Odesa Port", latitude: 46.5, longitude: 30.7, detail: "Black Sea grain corridor", risk: "Under air defense umbrella" },
    { id: "a5", type: "port", label: "Balboa Terminal", latitude: 9.0, longitude: -79.6, detail: "Panama Canal Pacific side", risk: "Draft restrictions easing" },
    { id: "a6", type: "office", label: "Dubai Ops Center", latitude: 25.2, longitude: 55.3, detail: "Regional logistics coordination" },
  ],
  routes: [
    { id: "r1", label: "Red Sea Route (DISRUPTED)", color: "#ef4444", points: [[103.8, 1.3], [80.0, 10.0], [55.0, 15.0], [43.0, 14.8], [40.0, 18.0], [32.3, 31.3]] },
    { id: "r2", label: "Cape of Good Hope Alt", color: "#eab308", points: [[103.8, 1.3], [80.0, 5.0], [55.0, -10.0], [30.0, -35.0], [18.0, -34.0], [0.0, -5.0], [-10.0, 30.0], [0.0, 48.0]] },
    { id: "r3", label: "Black Sea Corridor", color: "#f97316", points: [[30.7, 46.5], [32.0, 44.0], [29.0, 41.0], [26.0, 40.0]] },
    { id: "r4", label: "Panama Transit", color: "#22c55e", points: [[-79.6, 9.0], [-80.0, 10.0], [-82.0, 15.0], [-85.0, 20.0]] },
  ],
};

// ─────────────────────────────────────────────
// AVAILABLE COUNTRIES (for picker — not in any scenario by default)
// ─────────────────────────────────────────────
export const AVAILABLE_COUNTRIES: MockCountry[] = [
  {
    code: "RU", name: "Russia", riskScore: 72, riskLevel: "HIGH",
    trend: "STABLE", changePercent: -1, anomaly: false,
    headlines: ["Wagner Group remnants reorganize under MoD control", "Arctic military buildup continues", "Ruble stabilizes after sanctions adjustment"],
    latitude: 61.5, longitude: 105.3,
    sparkline: [75, 74, 74, 73, 73, 73, 72, 72, 72, 72, 72, 72], sentiment: -0.65, forecast30d: 71, volatility: "LOW",
  },
  {
    code: "AF", name: "Afghanistan", riskScore: 87, riskLevel: "CRITICAL",
    trend: "STABLE", changePercent: 0, anomaly: false,
    headlines: ["Taliban expands mining concessions to Chinese firms", "Humanitarian crisis deepens as aid funding drops", "IS-K attacks increase in northern provinces"],
    latitude: 33.9, longitude: 67.7,
    sparkline: [88, 87, 87, 87, 87, 87, 87, 87, 87, 87, 87, 87], sentiment: -0.90, forecast30d: 87, volatility: "LOW",
  },
  {
    code: "VE", name: "Venezuela", riskScore: 65, riskLevel: "ELEVATED",
    trend: "ESCALATING", changePercent: 7, anomaly: false,
    headlines: ["Opposition crackdown intensifies ahead of regional elections", "Oil production recovers to 900k bpd despite sanctions", "Border tensions with Guyana over Essequibo persist"],
    latitude: 6.4, longitude: -66.6,
    sparkline: [52, 54, 55, 56, 58, 59, 60, 61, 62, 63, 64, 65], sentiment: -0.48, forecast30d: 69, volatility: "MED",
  },
  {
    code: "ET", name: "Ethiopia", riskScore: 71, riskLevel: "HIGH",
    trend: "ESCALATING", changePercent: 10, anomaly: true,
    headlines: ["Amhara militia clashes spread to new regions", "Tigray reconstruction stalls amid renewed tensions", "Inflation hits 35% as drought continues"],
    latitude: 9.1, longitude: 40.5,
    sparkline: [55, 58, 60, 62, 63, 65, 66, 67, 68, 69, 70, 71], sentiment: -0.72, forecast30d: 76, volatility: "HIGH",
  },
  {
    code: "MM", name: "Myanmar", riskScore: 83, riskLevel: "CRITICAL",
    trend: "STABLE", changePercent: -1, anomaly: false,
    headlines: ["Resistance forces capture major border crossing", "Junta airstrikes target civilian areas in Sagaing", "China mediates ceasefire in northern Shan State"],
    latitude: 21.9, longitude: 95.9,
    sparkline: [85, 84, 84, 84, 83, 83, 83, 83, 83, 83, 83, 83], sentiment: -0.86, forecast30d: 82, volatility: "LOW",
  },
  {
    code: "SD", name: "Sudan", riskScore: 89, riskLevel: "CRITICAL",
    trend: "STABLE", changePercent: 2, anomaly: false,
    headlines: ["RSF advances on El Fasher despite international pressure", "Humanitarian catastrophe: 10M displaced", "Port Sudan becomes de facto government capital"],
    latitude: 12.9, longitude: 30.2,
    sparkline: [85, 86, 87, 87, 88, 88, 88, 89, 89, 89, 89, 89], sentiment: -0.93, forecast30d: 90, volatility: "LOW",
  },
  {
    code: "PH", name: "Philippines", riskScore: 44, riskLevel: "ELEVATED",
    trend: "ESCALATING", changePercent: 6, anomaly: false,
    headlines: ["South China Sea confrontation with Chinese coast guard", "US-Philippines joint patrols expanded", "Marcos pivots defense posture toward maritime"],
    latitude: 12.9, longitude: 121.8,
    sparkline: [35, 36, 37, 38, 39, 40, 41, 41, 42, 43, 43, 44], sentiment: -0.35, forecast30d: 48, volatility: "MED",
  },
  {
    code: "PK", name: "Pakistan", riskScore: 62, riskLevel: "ELEVATED",
    trend: "ESCALATING", changePercent: 5, anomaly: false,
    headlines: ["TTP attacks surge in Khyber Pakhtunkhwa province", "IMF bailout conditions trigger nationwide protests", "Military operations expanded along Afghan border"],
    latitude: 30.4, longitude: 69.3,
    sparkline: [52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 61, 62], sentiment: -0.58, forecast30d: 66, volatility: "MED",
  },
  {
    code: "MX", name: "Mexico", riskScore: 56, riskLevel: "ELEVATED",
    trend: "STABLE", changePercent: 1, anomaly: false,
    headlines: ["Cartel violence intensifies in Sinaloa after leadership split", "Judicial reform implementation creates investor uncertainty", "US-Mexico border security cooperation strained"],
    latitude: 23.6, longitude: -102.6,
    sparkline: [54, 54, 55, 55, 55, 55, 56, 56, 56, 56, 56, 56], sentiment: -0.40, forecast30d: 57, volatility: "LOW",
  },
  {
    code: "IL", name: "Israel", riskScore: 76, riskLevel: "HIGH",
    trend: "DE-ESCALATING", changePercent: -5, anomaly: false,
    headlines: ["Gaza ceasefire negotiations enter final stage", "Hezbollah border tensions de-escalate after prisoner exchange", "Iron Dome intercepts remain at elevated tempo"],
    latitude: 31.0, longitude: 34.9,
    sparkline: [85, 84, 83, 82, 81, 80, 79, 78, 78, 77, 77, 76], sentiment: -0.62, forecast30d: 73, volatility: "MED",
  },
  {
    code: "CO", name: "Colombia", riskScore: 48, riskLevel: "ELEVATED",
    trend: "STABLE", changePercent: -2, anomaly: false,
    headlines: ["ELN peace talks resume after 3-month pause", "Coca production hits record levels in Pacific coast", "Venezuelan migration strains border communities"],
    latitude: 4.6, longitude: -74.3,
    sparkline: [50, 50, 49, 49, 49, 49, 48, 48, 48, 48, 48, 48], sentiment: -0.28, forecast30d: 47, volatility: "LOW",
  },
  {
    code: "IN", name: "India", riskScore: 35, riskLevel: "MODERATE",
    trend: "STABLE", changePercent: 0, anomaly: false,
    headlines: ["India-China LAC disengagement progresses cautiously", "Kashmir security operations continue at steady tempo", "Economic growth maintains 6.5% trajectory"],
    latitude: 20.6, longitude: 79.0,
    sparkline: [36, 36, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35], sentiment: 0.10, forecast30d: 34, volatility: "LOW",
  },
];

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
export const DEMO_SCENARIOS: DemoScenario[] = [
  meridianEnergy,
  pacificSemiconductor,
  atlasLogistics,
];

export const DEFAULT_SCENARIO = meridianEnergy;
