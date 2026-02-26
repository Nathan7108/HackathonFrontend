// src/lib/placeholder-data.ts
// Static watchlist data for the command-center dashboard

export type RiskLevel = "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";

export interface CountryData {
  code: string;
  name: string;
  flag: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  subScores: {
    conflictIntensity: number;
    socialUnrest: number;
    economicStress: number;
  };
  anomaly: {
    detected: boolean;
    score: number;
    severity: "LOW" | "MED" | "HIGH";
  };
  forecast: {
    score30d: number;
    score60d: number;
    score90d: number;
    trend: "ESCALATING" | "STABLE" | "DE-ESCALATING";
  };
  mlMetadata: {
    topDrivers: string[];
    dataSources: string[];
    modelVersion: string;
  };
  briefText: string[];
  causalChain: { step: number; title: string; description: string }[];
  headlines: string[];
  featureImportance: { feature: string; importance: number }[];
  industryExposure: string[];
  keyActors: string[];
  // Approximate coordinates for map markers
  latitude: number;
  longitude: number;
}

export const WATCHLIST_COUNTRIES: CountryData[] = [
  {
    code: "UA",
    name: "Ukraine",
    flag: "🇺🇦",
    riskScore: 87,
    riskLevel: "CRITICAL",
    confidence: 0.94,
    latitude: 48.4,
    longitude: 30.5,
    subScores: { conflictIntensity: 95, socialUnrest: 72, economicStress: 68 },
    anomaly: { detected: true, score: 0.91, severity: "HIGH" },
    forecast: { score30d: 86, score60d: 85, score90d: 84, trend: "STABLE" },
    mlMetadata: {
      topDrivers: ["acled_battle_count", "acled_fatalities", "gdelt_goldstein"],
      dataSources: ["ACLED", "GDELT", "UCDP", "FinBERT"],
      modelVersion: "v4.2.1",
    },
    briefText: [
      "ML models detect sustained escalation across conflict and economic indicators. Anomaly detector flagged 3.2σ deviation from baseline. Artillery strikes on energy infrastructure have intensified in the past 72 hours, disrupting power supply to 4 oblasts.",
    ],
    causalChain: [
      { step: 1, title: "Artillery Escalation", description: "ACLED records 340% increase in artillery events" },
      { step: 2, title: "Infrastructure Targeting", description: "Energy grid attacks compound economic stress" },
      { step: 3, title: "Displacement Wave", description: "Internal displacement accelerates westward migration" },
    ],
    headlines: [
      "Russian forces intensify strikes on energy infrastructure",
      "EU announces new sanctions package targeting defense sector",
      "Ceasefire negotiations stall as both sides report violations",
    ],
    featureImportance: [
      { feature: "acled_battle_count", importance: 0.31 },
      { feature: "gdelt_goldstein", importance: 0.24 },
      { feature: "acled_fatalities", importance: 0.19 },
    ],
    industryExposure: ["Energy", "Agriculture", "Logistics"],
    keyActors: ["Ukrainian Armed Forces", "Russian MoD", "NATO", "EU Council"],
  },
  {
    code: "IR",
    name: "Iran",
    flag: "🇮🇷",
    riskScore: 79,
    riskLevel: "HIGH",
    confidence: 0.89,
    latitude: 32.4,
    longitude: 53.7,
    subScores: { conflictIntensity: 74, socialUnrest: 81, economicStress: 78 },
    anomaly: { detected: true, score: 0.84, severity: "HIGH" },
    forecast: { score30d: 82, score60d: 80, score90d: 78, trend: "STABLE" },
    mlMetadata: {
      topDrivers: ["gdelt_event_acceleration", "finbert_negative_score", "acled_protest_count"],
      dataSources: ["GDELT", "FinBERT", "ACLED"],
      modelVersion: "v4.2.1",
    },
    briefText: [
      "IRGC naval exercises in Strait of Hormuz entered second week. Enrichment reports at 84% threshold triggering IAEA emergency consultation. Domestic protest activity at 18-month high driven by economic deterioration.",
    ],
    causalChain: [
      { step: 1, title: "Nuclear Escalation", description: "84% enrichment threshold crossed per IAEA" },
      { step: 2, title: "Sanctions Tightening", description: "EU/US coordinating new sanctions package" },
      { step: 3, title: "Domestic Unrest", description: "Economic deterioration fueling protest cycles" },
    ],
    headlines: [
      "IAEA reports Iran enrichment at 84% — weapons-grade threshold",
      "Strait of Hormuz military exercises enter second week",
      "EU sanctions package targets Iranian petrochemical sector",
    ],
    featureImportance: [
      { feature: "gdelt_event_acceleration", importance: 0.28 },
      { feature: "finbert_negative_score", importance: 0.22 },
      { feature: "acled_protest_count", importance: 0.17 },
    ],
    industryExposure: ["Energy", "Shipping", "Finance"],
    keyActors: ["IRGC", "IAEA", "US CENTCOM", "EU Council"],
  },
  {
    code: "PK",
    name: "Pakistan",
    flag: "🇵🇰",
    riskScore: 62,
    riskLevel: "ELEVATED",
    confidence: 0.82,
    latitude: 30.4,
    longitude: 69.3,
    subScores: { conflictIntensity: 68, socialUnrest: 74, economicStress: 71 },
    anomaly: { detected: true, score: 0.72, severity: "MED" },
    forecast: { score30d: 66, score60d: 64, score90d: 61, trend: "STABLE" },
    mlMetadata: {
      topDrivers: ["acled_protest_count", "finbert_negative_score", "ucdp_conflict_events"],
      dataSources: ["ACLED", "FinBERT", "UCDP"],
      modelVersion: "v4.2.1",
    },
    briefText: [
      "TTP attacks surge in Khyber Pakhtunkhwa province. IMF bailout conditions triggering nationwide protests. Military operations expanded along Afghan border creating refugee displacement concerns.",
    ],
    causalChain: [
      { step: 1, title: "TTP Resurgence", description: "Terror attacks 40% above 90-day baseline" },
      { step: 2, title: "Economic Pressure", description: "IMF conditionality driving civil unrest" },
      { step: 3, title: "Border Instability", description: "Afghan border operations displacing communities" },
    ],
    headlines: [
      "TTP attacks surge in Khyber Pakhtunkhwa province",
      "IMF bailout conditions trigger nationwide protests",
      "Military operations expanded along Afghan border",
    ],
    featureImportance: [
      { feature: "acled_protest_count", importance: 0.26 },
      { feature: "finbert_negative_score", importance: 0.21 },
      { feature: "ucdp_conflict_events", importance: 0.18 },
    ],
    industryExposure: ["Agriculture", "Textiles", "Energy"],
    keyActors: ["Pakistan Army", "TTP", "IMF", "Afghan Taliban"],
  },
  {
    code: "ET",
    name: "Ethiopia",
    flag: "🇪🇹",
    riskScore: 68,
    riskLevel: "HIGH",
    confidence: 0.78,
    latitude: 9.1,
    longitude: 40.5,
    subScores: { conflictIntensity: 79, socialUnrest: 65, economicStress: 72 },
    anomaly: { detected: true, score: 0.76, severity: "HIGH" },
    forecast: { score30d: 71, score60d: 69, score90d: 66, trend: "STABLE" },
    mlMetadata: {
      topDrivers: ["acled_battle_count", "ucdp_conflict_events", "gdelt_tone_shift"],
      dataSources: ["ACLED", "UCDP", "GDELT"],
      modelVersion: "v4.2.1",
    },
    briefText: [
      "Amhara militia clashes spread to new regions. Tigray reconstruction stalls amid renewed tensions. Inflation at 35% compounding civilian hardship across drought-affected regions.",
    ],
    causalChain: [
      { step: 1, title: "Amhara Conflict", description: "Militia clashes expanding beyond Amhara region" },
      { step: 2, title: "Tigray Fragility", description: "Peace deal implementation faltering" },
      { step: 3, title: "Economic Collapse", description: "35% inflation eroding social stability" },
    ],
    headlines: [
      "Amhara militia clashes spread to new regions",
      "Tigray reconstruction stalls amid renewed tensions",
      "Inflation hits 35% as drought conditions persist",
    ],
    featureImportance: [
      { feature: "acled_battle_count", importance: 0.30 },
      { feature: "ucdp_conflict_events", importance: 0.23 },
      { feature: "gdelt_tone_shift", importance: 0.16 },
    ],
    industryExposure: ["Agriculture", "Telecom", "Mining"],
    keyActors: ["ENDF", "Amhara Fano", "AU", "UN OCHA"],
  },
  {
    code: "VE",
    name: "Venezuela",
    flag: "🇻🇪",
    riskScore: 55,
    riskLevel: "ELEVATED",
    confidence: 0.76,
    latitude: 6.4,
    longitude: -66.6,
    subScores: { conflictIntensity: 45, socialUnrest: 62, economicStress: 79 },
    anomaly: { detected: false, score: 0.41, severity: "LOW" },
    forecast: { score30d: 58, score60d: 56, score90d: 54, trend: "STABLE" },
    mlMetadata: {
      topDrivers: ["finbert_negative_score", "gdelt_protest_count", "acled_violence_count"],
      dataSources: ["FinBERT", "GDELT", "ACLED"],
      modelVersion: "v4.2.1",
    },
    briefText: [
      "Opposition crackdown intensifying ahead of regional elections. Oil production recovering to 900k bpd despite sanctions. Border tensions with Guyana over Essequibo region persist as election pressure mounts.",
    ],
    causalChain: [
      { step: 1, title: "Political Repression", description: "Opposition arrests ahead of elections" },
      { step: 2, title: "Essequibo Dispute", description: "Border tension with Guyana escalating" },
      { step: 3, title: "Economic Fragility", description: "Hyperinflation despite oil recovery" },
    ],
    headlines: [
      "Opposition crackdown intensifies ahead of regional elections",
      "Oil production recovers to 900k bpd despite sanctions",
      "Border tensions with Guyana over Essequibo persist",
    ],
    featureImportance: [
      { feature: "finbert_negative_score", importance: 0.25 },
      { feature: "gdelt_protest_count", importance: 0.20 },
      { feature: "acled_violence_count", importance: 0.15 },
    ],
    industryExposure: ["Energy", "Mining", "Finance"],
    keyActors: ["Maduro Government", "Opposition MUD", "US OFAC", "China CNPC"],
  },
  {
    code: "TW",
    name: "Taiwan",
    flag: "🇹🇼",
    riskScore: 72,
    riskLevel: "HIGH",
    confidence: 0.91,
    latitude: 23.7,
    longitude: 120.9,
    subScores: { conflictIntensity: 71, socialUnrest: 28, economicStress: 32 },
    anomaly: { detected: true, score: 0.88, severity: "HIGH" },
    forecast: { score30d: 75, score60d: 74, score90d: 71, trend: "STABLE" },
    mlMetadata: {
      topDrivers: ["gdelt_event_acceleration", "acled_military_events", "finbert_negative_score"],
      dataSources: ["GDELT", "ACLED", "FinBERT"],
      modelVersion: "v4.2.1",
    },
    briefText: [
      "PLA Taiwan Strait exercises at largest scale since August 2024. US carrier group repositioned to Western Pacific. TSMC announcing emergency fab diversification to Arizona as supply chain risk intensifies.",
    ],
    causalChain: [
      { step: 1, title: "PLA Exercises", description: "71 aircraft, 14 naval vessels in Strait exercises" },
      { step: 2, title: "US Repositioning", description: "Carrier strike group moved to Western Pacific" },
      { step: 3, title: "Supply Chain Risk", description: "TSMC diversification announcement signals risk" },
    ],
    headlines: [
      "PLA conducts largest Taiwan Strait exercises since 2024",
      "TSMC announces emergency fab diversification to Arizona",
      "US carrier group repositions to Western Pacific",
    ],
    featureImportance: [
      { feature: "gdelt_event_acceleration", importance: 0.34 },
      { feature: "acled_military_events", importance: 0.26 },
      { feature: "finbert_negative_score", importance: 0.18 },
    ],
    industryExposure: ["Semiconductors", "Electronics", "Shipping"],
    keyActors: ["PLA", "US DoD", "TSMC", "Taiwan MND"],
  },
  {
    code: "RS",
    name: "Serbia",
    flag: "🇷🇸",
    riskScore: 38,
    riskLevel: "MODERATE",
    confidence: 0.71,
    latitude: 44.0,
    longitude: 21.0,
    subScores: { conflictIntensity: 22, socialUnrest: 54, economicStress: 41 },
    anomaly: { detected: false, score: 0.28, severity: "LOW" },
    forecast: { score30d: 37, score60d: 36, score90d: 35, trend: "DE-ESCALATING" },
    mlMetadata: {
      topDrivers: ["gdelt_protest_count", "finbert_negative_score", "acled_civil_unrest"],
      dataSources: ["GDELT", "FinBERT", "ACLED"],
      modelVersion: "v4.2.1",
    },
    briefText: [
      "Mass protests in Belgrade continue into third month driven by corruption concerns. EU accession negotiations stalled. Kosovo relations remain source of regional tension but below conflict threshold.",
    ],
    causalChain: [
      { step: 1, title: "Mass Protests", description: "Belgrade protests 12th consecutive week" },
      { step: 2, title: "EU Accession Stall", description: "Reforms inadequate per EU progress report" },
      { step: 3, title: "Kosovo Tension", description: "KFOR deployment at elevated posture" },
    ],
    headlines: [
      "Belgrade protests continue over corruption and democratic backsliding",
      "EU-Serbia accession talks stall over rule of law",
      "Kosovo border incident raises regional tension briefly",
    ],
    featureImportance: [
      { feature: "gdelt_protest_count", importance: 0.28 },
      { feature: "finbert_negative_score", importance: 0.18 },
      { feature: "acled_civil_unrest", importance: 0.14 },
    ],
    industryExposure: ["Mining", "Agriculture", "Manufacturing"],
    keyActors: ["Vucic Government", "Opposition SNS", "EU", "Kosovo PISG"],
  },
  {
    code: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    riskScore: 28,
    riskLevel: "MODERATE",
    confidence: 0.68,
    latitude: -14.2,
    longitude: -51.9,
    subScores: { conflictIntensity: 18, socialUnrest: 38, economicStress: 34 },
    anomaly: { detected: false, score: 0.19, severity: "LOW" },
    forecast: { score30d: 27, score60d: 26, score90d: 25, trend: "DE-ESCALATING" },
    mlMetadata: {
      topDrivers: ["acled_violence_count", "gdelt_protest_count", "finbert_negative_score"],
      dataSources: ["ACLED", "GDELT", "FinBERT"],
      modelVersion: "v4.2.1",
    },
    briefText: [
      "Political polarization declining post-election. Fiscal reform progress stabilizing investor confidence. Amazon deforestation enforcement showing measurable results reducing environmental risk premium.",
    ],
    causalChain: [
      { step: 1, title: "Political Stabilization", description: "Post-election tensions de-escalating" },
      { step: 2, title: "Fiscal Reform", description: "Budget framework passing congressional review" },
      { step: 3, title: "Amazon Policy", description: "Deforestation rates falling 50% year-over-year" },
    ],
    headlines: [
      "Brazil fiscal reform package advances through congress",
      "Amazon deforestation rates drop 50% under new enforcement",
      "Lula government stabilizes after political turbulence",
    ],
    featureImportance: [
      { feature: "acled_violence_count", importance: 0.22 },
      { feature: "gdelt_protest_count", importance: 0.16 },
      { feature: "finbert_negative_score", importance: 0.14 },
    ],
    industryExposure: ["Agriculture", "Mining", "Finance"],
    keyActors: ["Lula Government", "Congress", "Supreme Court", "Military"],
  },
  // Placeholders — excluded from dashboard display
  {
    code: "P1",
    name: "PLACEHOLDER",
    flag: "🏳️",
    riskScore: 0,
    riskLevel: "LOW",
    confidence: 0,
    latitude: 0,
    longitude: 0,
    subScores: { conflictIntensity: 0, socialUnrest: 0, economicStress: 0 },
    anomaly: { detected: false, score: 0, severity: "LOW" },
    forecast: { score30d: 0, score60d: 0, score90d: 0, trend: "STABLE" },
    mlMetadata: { topDrivers: [], dataSources: [], modelVersion: "" },
    briefText: [],
    causalChain: [],
    headlines: [],
    featureImportance: [],
    industryExposure: [],
    keyActors: [],
  },
  {
    code: "P2",
    name: "PLACEHOLDER",
    flag: "🏳️",
    riskScore: 0,
    riskLevel: "LOW",
    confidence: 0,
    latitude: 0,
    longitude: 0,
    subScores: { conflictIntensity: 0, socialUnrest: 0, economicStress: 0 },
    anomaly: { detected: false, score: 0, severity: "LOW" },
    forecast: { score30d: 0, score60d: 0, score90d: 0, trend: "STABLE" },
    mlMetadata: { topDrivers: [], dataSources: [], modelVersion: "" },
    briefText: [],
    causalChain: [],
    headlines: [],
    featureImportance: [],
    industryExposure: [],
    keyActors: [],
  },
];

// The 8 real countries (no placeholders), sorted by risk score descending
export const ACTIVE_COUNTRIES = WATCHLIST_COUNTRIES.filter(
  (c) => c.code !== "P1" && c.code !== "P2"
).sort((a, b) => b.riskScore - a.riskScore);
