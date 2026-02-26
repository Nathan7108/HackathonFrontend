// Country risk data from /api/countries
export interface CountryRisk {
  countryCode: string;
  country: string;
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";
}

// Dashboard summary from /api/dashboard/summary
export interface DashboardSummary {
  globalThreatIndex: number;
  activeAnomalies: number;
  highPlusCountries: number;
  escalationAlerts24h: number;
  modelHealth: {
    accuracy: number;
    features: number;
    countries: number;
    trainingYears: number;
  };
  countries: CountryRisk[];
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
