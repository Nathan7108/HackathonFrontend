import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { DashboardSubScores } from "@/lib/types";

export function useSubScores() {
  const [data, setData] = useState<DashboardSubScores | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getDashboardSubScores()
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
