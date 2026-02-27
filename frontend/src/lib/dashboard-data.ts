// src/lib/dashboard-data.ts
// Static chart and analytics data for the command-center dashboard.
// Risk Distribution and Regional Breakdown come from /api/dashboard/kpis (real data).

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
