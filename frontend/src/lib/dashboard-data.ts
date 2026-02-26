// src/lib/dashboard-data.ts
// Static chart and analytics data for the command-center dashboard

export const RISK_DISTRIBUTION = [
  { tier: "CRITICAL", count: 7 },
  { tier: "HIGH", count: 15 },
  { tier: "ELEVATED", count: 28 },
  { tier: "MODERATE", count: 38 },
  { tier: "LOW", count: 113 },
];

export const REGIONAL_BREAKDOWN = [
  { region: "Middle East", avgRisk: 71, anomalies: 3, escalations: 2 },
  { region: "Sub-Saharan Africa", avgRisk: 64, anomalies: 4, escalations: 3 },
  { region: "South Asia", avgRisk: 58, anomalies: 2, escalations: 2 },
  { region: "East Asia", avgRisk: 52, anomalies: 2, escalations: 1 },
  { region: "Europe", avgRisk: 44, anomalies: 1, escalations: 1 },
  { region: "Latin America", avgRisk: 38, anomalies: 0, escalations: 0 },
];

// 30 days of media sentiment (last entry = today)
export const SENTIMENT_TREND_30D = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  escalatory: Math.round(40 + Math.sin(i * 0.3) * 8 + i * 0.2),
  neutral: Math.round(35 - Math.sin(i * 0.2) * 5),
  deescalatory: Math.round(25 - Math.sin(i * 0.3) * 4 - i * 0.1),
}));

// 12 weeks of model accuracy
export const MODEL_PERFORMANCE = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  accuracy: +(97.0 + (i / 11) * 1.3 + Math.sin(i * 0.5) * 0.2).toFixed(1),
}));

export const TOP_ESCALATING = [
  { country: "Sudan", delta: 14 },
  { country: "Myanmar", delta: 11 },
  { country: "Haiti", delta: 9 },
  { country: "Ethiopia", delta: 7 },
  { country: "Iran", delta: 5 },
];

export const TOP_DEESCALATING = [
  { country: "Colombia", delta: -8 },
  { country: "Iraq", delta: -6 },
  { country: "Israel", delta: -5 },
  { country: "Brazil", delta: -4 },
  { country: "Serbia", delta: -3 },
];

// 5 sparkline arrays of 7 values each (for KPI cards)
export const KPI_SPARKLINE_DATA: number[][] = [
  [44, 45, 46, 45, 47, 46, 47],   // Global Threat Index
  [10, 11, 12, 11, 12, 12, 12],   // Active Anomalies
  [15, 16, 17, 16, 17, 17, 17],   // HIGH+ Countries
  [3, 4, 4, 4, 4, 4, 4],          // Escalation Alerts
  [97, 97.2, 97.5, 97.8, 98, 98, 98], // Model Accuracy
];
