import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { DashboardSummary, DashboardCountry } from "@/lib/types";
import { ACTIVE_COUNTRIES } from "@/lib/placeholder-data";

const FALLBACK_COUNTRIES: DashboardCountry[] = ACTIVE_COUNTRIES.map((c) => ({
  code: c.code,
  name: c.name,
  riskScore: c.riskScore,
  riskLevel: c.riskLevel,
  isAnomaly: c.anomaly.detected,
  anomalyScore: c.anomaly.score,
}));

const FALLBACK: DashboardSummary = {
  globalThreatIndex: 47,
  globalThreatIndexDelta: 3,
  activeAnomalies: 12,
  highPlusCountries: 17,
  highPlusCountriesDelta: 2,
  escalationAlerts24h: 4,
  modelHealth: 98.0,
  countries: FALLBACK_COUNTRIES,
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardSummary>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .getDashboardSummary()
      .then((res) => {
        if (cancelled) return;
        const allZero = res.countries.length > 0 && res.countries.every((c) => c.riskScore === 0);
        if (allZero) {
          setData(FALLBACK);
          setError(true);
        } else {
          setData(res);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(FALLBACK);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
