import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { DashboardKpis, DashboardCountry } from "@/lib/types";

const EMPTY_KPIS: DashboardKpis = {
  globalThreatIndex: { score: 0, delta24h: 0, trend: "STABLE", topContributors: [] },
  activeAnomalies: { total: 0, bySeverity: { HIGH: 0, MED: 0, LOW: 0 }, countries: [] },
  riskDistribution: { distribution: {}, totalCountries: 0, recentChanges: [] },
  regionalBreakdown: [],
  escalationAlerts: { count: 0, alerts: [] },
  sourcesActive: { active: 0, total: 0, sources: [] },
  computedAt: "",
};

export interface DashboardData {
  kpis: DashboardKpis;
  countries: DashboardCountry[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({ kpis: EMPTY_KPIS, countries: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([api.getDashboardKpis(), api.getDashboardSummary()])
      .then(([kpis, summary]) => {
        if (cancelled) return;
        setData({ kpis, countries: summary.countries ?? [] });
        setError(false);
      })
      .catch(() => {
        if (!cancelled) {
          setData({ kpis: EMPTY_KPIS, countries: [] });
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
