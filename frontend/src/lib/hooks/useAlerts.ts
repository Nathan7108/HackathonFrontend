import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { DashboardAlertsResponse } from "@/lib/types";

export function useAlerts() {
  const [data, setData] = useState<DashboardAlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getDashboardAlerts()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError(false);
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
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
