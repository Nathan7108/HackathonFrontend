// Country risk data from /api/countries
export interface CountryRisk {
  countryCode: string;
  country: string;
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";
}

// Dashboard summary from /api/dashboard/summary (legacy)
export interface DashboardSummary {
  globalThreatIndex: number;
  globalThreatIndexDelta: number;
  activeAnomalies: number;
  highPlusCountries: number;
  highPlusCountriesDelta: number;
  escalationAlerts24h: number;
  modelHealth: number;
  countries: DashboardCountry[];
}

// Rich KPIs from /api/dashboard/kpis
export interface DashboardKpis {
  globalThreatIndex: {
    score: number;
    delta24h: number;
    trend: "ESCALATING" | "STABLE" | "DE-ESCALATING";
    topContributors: { country: string; code: string; score: number; delta: number }[];
  };
  activeAnomalies: {
    total: number;
    bySeverity: { HIGH: number; MED: number; LOW: number };
    countries: { code: string; name: string; severity: string; score: number; trigger: string }[];
  };
  riskDistribution: {
    distribution: Record<string, number>;
    totalCountries: number;
    recentChanges: { country: string; code: string; from: string; to: string; changedAt: string }[];
  };
  regionalBreakdown: {
    region: string;
    avgRisk: number;
    anomalies: number;
    escalations: number;
    countries?: number;
  }[];
  escalationAlerts: {
    count: number;
    alerts: { type: string; country: string; code: string; detail: string; time: string }[];
  };
  sourcesActive: {
    active: number;
    total: number;
    sources: { name: string; status: string; lastUpdate: string | null; frequency: string; records: string }[];
  };
  modelAccuracy?: number;
  computedAt: string;
}

// Time-series for KPI background charts from /api/dashboard/kpis/history
export interface KpiHistorySeries {
  period: string;
  values: number[];
}

// Aggregate sub-scores from /api/dashboard/sub-scores (real ML features)
export interface SubScoreItem {
  value: number;
  delta: number;
  description: string;
  drivers: string[];
}

export interface DashboardSubScores {
  subScores: {
    conflictIntensity: SubScoreItem;
    socialUnrest: SubScoreItem;
    economicStress: SubScoreItem;
    humanitarian: SubScoreItem;
    mediaSentiment: SubScoreItem;
  };
  computedAt: string;
}

export interface DashboardKpiHistory {
  globalThreatIndex: KpiHistorySeries;
  activeAnomalies: KpiHistorySeries;
  highPlusCountries: KpiHistorySeries;
  escalationAlerts: KpiHistorySeries;
  modelAccuracy: KpiHistorySeries;
  sourcesActive: KpiHistorySeries;
}

export interface DashboardCountry {
  code: string;
  name: string;
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";
  isAnomaly: boolean;
  anomalyScore: number;
}

// Per-country sub-scores from /api/analyze (ML sub-dimensions 0–100)
export interface AnalyzeSubScores {
  conflictIntensity: number;
  socialUnrest: number;
  economicStress: number;
  humanitarian: number;
  mediaSentiment: number;
}

// Full analysis from /api/analyze
export interface AnalyzeResult {
  riskScore: number;
  riskLevel: string;
  summary: string;
  keyFactors: string[];
  industries: string[];
  watchList: string[];
  causalChain: CausalStep[];
  subScores?: AnalyzeSubScores;
  mlMetadata: MLMetadata;
}

export interface CausalStep {
  step: number;
  title: string;
  description: string;
  confidence?: number;
  dataSource?: "GDELT" | "ACLED" | "UCDP" | "FinBERT" | "LSTM" | "Sentinel";
}

// Country analysis page: headlines with sentiment
export interface HeadlineWithSentiment {
  id: string;
  title: string;
  sentiment: "NEGATIVE" | "NEUTRAL" | "POSITIVE";
  confidence: number;
  source?: string;
  date?: string;
}

// ACLED-style event for country analysis
export interface ACLEvent {
  id: string;
  type: "Battle" | "Explosion" | "Protest" | "Violence against civilians" | "Riots" | "Strategic development";
  fatalities?: number;
  location: string;
  lat: number;
  lon: number;
  date: string;
}

// Asset at risk in this country (for "Your Assets at Risk" section)
export interface AssetAtRisk {
  id: string;
  name: string;
  type: "Refinery" | "Fab" | "Port" | "Office" | "Facility" | "Supplier";
  distanceFromConflict: string;
  riskExposure: "CRITICAL" | "HIGH" | "ELEVATED" | "MODERATE" | "LOW";
  recommendedAction: string;
  lat?: number;
  lon?: number;
}

export interface MLMetadata {
  riskScore: number;
  confidence: number;
  anomalyDetected: boolean;
  anomalyScore: number;
  sentimentLabel: string;
  escalatoryPct: number;
  topDrivers: string[];
  dataSources: string[];
  modelVersion: string;
}

// Forecast from /api/forecast
export interface ForecastResult {
  forecast_30d: number;
  forecast_60d: number;
  forecast_90d: number;
  trend: "ESCALATING" | "STABLE" | "DE-ESCALATING";
}

// Anomaly from /api/anomalies
export interface AnomalyResult {
  countryCode: string;
  country: string;
  anomalyScore: number;
  isAnomaly: boolean;
  severity: "HIGH" | "MED" | "LOW";
}

// Recent activity feed from /api/recent-activity (NewsAPI)
export interface RecentActivityItem {
  time: string;
  icon: string;
  text: string;
  country: string;
  type: string;
}

export interface RecentActivityResponse {
  items: RecentActivityItem[];
  /** Set when NewsAPI fails (e.g. apiKeyInvalid). */
  error?: "noApiKey" | "apiKeyInvalid" | "fetchFailed";
}

// Escalation alerts from /api/dashboard/alerts (real ML data)
export interface DashboardAlert {
  type: "TIER_CHANGE" | "SCORE_SPIKE" | "ANOMALY_DETECTED";
  country: string;
  code: string;
  detail: string;
  time: string;
  severity: "HIGH" | "ELEVATED" | "MODERATE" | "LOW";
}

export interface DashboardAlertsResponse {
  alerts: DashboardAlert[];
  computedAt: string;
}
