import type {
  DashboardSummary,
  DashboardKpis,
  DashboardKpiHistory,
  DashboardSubScores,
  DashboardAlertsResponse,
  AnalyzeResult,
  ForecastResult,
  AnomalyResult,
  RecentActivityResponse,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  getDashboardSummary: () =>
    fetchJSON<DashboardSummary>("/api/dashboard/summary"),

  getDashboardKpis: () =>
    fetchJSON<DashboardKpis>("/api/dashboard/kpis"),

  getDashboardKpiHistory: () =>
    fetchJSON<DashboardKpiHistory>("/api/dashboard/kpis/history"),

  getDashboardSubScores: () =>
    fetchJSON<DashboardSubScores>("/api/dashboard/sub-scores"),

  getDashboardAlerts: () =>
    fetchJSON<DashboardAlertsResponse>("/api/dashboard/alerts"),

  getCountries: () =>
    fetchJSON<import("./types").CountryRisk[]>("/api/countries"),

  analyzeCountry: (country: string, countryCode: string) =>
    fetchJSON<AnalyzeResult>("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ country, countryCode }),
    }),

  getForecast: (country: string, countryCode: string) =>
    fetchJSON<ForecastResult>("/api/forecast", {
      method: "POST",
      body: JSON.stringify({ country, countryCode }),
    }),

  getAnomalies: () =>
    fetchJSON<AnomalyResult[]>("/api/anomalies"),

  getRecentActivity: () =>
    fetchJSON<RecentActivityResponse>("/api/recent-activity"),

  getTrackRecord: () =>
    fetchJSON<unknown[]>("/api/track-record"),
};
