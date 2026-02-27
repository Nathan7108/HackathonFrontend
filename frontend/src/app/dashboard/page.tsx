"use client";

import { StatusBar } from "@/components/dashboard/StatusBar";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { WatchlistTable } from "@/components/dashboard/WatchlistTable";
import { ThreatMap } from "@/components/dashboard/ThreatMap";
import { RiskSignalDecompositionCard } from "@/components/dashboard/RiskSignalDecompositionCard";
import { IntelPanel } from "@/components/dashboard/IntelPanel";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { AnalyticsGrid } from "@/components/dashboard/AnalyticsGrid";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
export default function DashboardPage() {
  const { data, loading } = useDashboardData();
  const focusCountry = data.countries?.[0] ?? null;

  return (
    <div className="flex flex-col min-h-full min-w-0 gap-3">
      <StatusBar />

      <div className="flex flex-col gap-3 flex-1 min-h-0 py-3" style={{ paddingLeft: 12, paddingRight: 12 }}>
        <div>
          <KpiStrip data={data.kpis} loading={loading} />
        </div>

        <div className="grid grid-cols-2 gap-3" style={{ alignItems: "start" }}>
          <div className="flex flex-col gap-3">
            <WatchlistTable countries={data.countries} />
            <AlertFeed />
            <RiskSignalDecompositionCard
              countryName={focusCountry?.name ?? null}
              countryCode={focusCountry?.code ?? null}
              riskLevel={focusCountry?.riskLevel}
            />
          </div>
          <div className="flex flex-col gap-3">
            <ThreatMap />
            <AnalyticsGrid />
            <IntelPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
