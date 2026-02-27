"use client";

import { useState } from "react";
import { RiSearchLine } from "@remixicon/react";
import { BarList, Card, Dialog, DialogPanel, TextInput } from "@tremor/react";
import { getCountryFlagEmoji } from "@/lib/country-flag";
import type { DashboardCountry } from "@/lib/types";

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-green-50">
      <span className="relative flex h-1.5 w-1.5">
        <span className="light-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
      </span>
      <span className="text-[9px] font-bold text-green-600 uppercase">Live</span>
    </span>
  );
}

const valueFormatter = (number: number) =>
  `${Intl.NumberFormat("us").format(number).toString()} pts`;

/** BarList items: name (with flag), value = riskScore. No per-item color (neutral bar like example). */
function countriesToBarList(countries: DashboardCountry[]) {
  return countries.map((c) => ({
    key: c.code,
    name: `${getCountryFlagEmoji(c.code)} ${c.name}`,
    value: c.riskScore,
  }));
}

interface WatchlistTableProps {
  countries: DashboardCountry[];
}

export function WatchlistTable({ countries }: WatchlistTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const sorted = [...countries].sort((a, b) => b.riskScore - a.riskScore);
  const allItems = countriesToBarList(sorted);
  const filteredItems = searchQuery.trim()
    ? allItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allItems;
  const topItems = allItems.slice(0, 5);
  const totalMonitored = sorted.length;

  return (
    <>
      <Card className="relative flex flex-col h-full min-h-0">
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Watchlist
          </p>
          <LiveBadge />
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
            {totalMonitored} monitored
          </span>
        </div>
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong mt-1">
          {totalMonitored} countries
        </p>
        <div className="mt-4 flex items-center justify-between shrink-0">
          <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Top 5 by risk score
          </p>
          <p className="text-tremor-label font-medium uppercase text-tremor-content dark:text-dark-tremor-content">
            Score
          </p>
        </div>
        <BarList
          data={topItems}
          valueFormatter={valueFormatter}
          className="bar-list-thin mt-2 flex-1 min-h-0"
        />
        <div className="absolute inset-x-0 bottom-0 flex justify-center rounded-b-tremor-default bg-gradient-to-t from-tremor-background to-transparent dark:from-dark-tremor-background py-7 pointer-events-none" />
        <div className="relative flex justify-center pt-2 pb-2">
          <button
            type="button"
            className="flex items-center justify-center rounded-tremor-small border border-tremor-border bg-tremor-background px-2.5 py-2 text-tremor-default font-medium text-tremor-content-strong shadow-tremor-input hover:bg-tremor-background-muted dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:text-dark-tremor-content-strong dark:shadow-dark-tremor-input hover:dark:bg-dark-tremor-background-muted"
            onClick={() => setIsOpen(true)}
          >
            Show more
          </button>
        </div>
      </Card>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} static className="z-[100]">
        <DialogPanel className="overflow-hidden p-0 max-w-lg">
          <div className="px-6 pb-4 pt-6">
            <TextInput
              icon={RiSearchLine}
              placeholder="Search country..."
              className="rounded-tremor-small"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <div className="flex items-center justify-between pt-4">
              <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Countries
              </p>
              <p className="text-tremor-label font-medium uppercase text-tremor-content dark:text-dark-tremor-content">
                Risk score
              </p>
            </div>
          </div>
          <div className="h-96 overflow-y-auto px-6">
            {filteredItems.length > 0 ? (
              <BarList
                data={filteredItems}
                valueFormatter={valueFormatter}
                className="bar-list-thin"
              />
            ) : (
              <p className="flex h-full items-center justify-center text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong">
                No results.
              </p>
            )}
          </div>
          <div className="mt-4 border-t border-tremor-border bg-tremor-background-muted p-6 dark:border-dark-tremor-border dark:bg-dark-tremor-background">
            <button
              type="button"
              className="flex w-full items-center justify-center rounded-tremor-small border border-tremor-border bg-tremor-background py-2 text-tremor-default font-medium text-tremor-content-strong shadow-tremor-input hover:bg-tremor-background-muted dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:text-dark-tremor-content-strong dark:shadow-dark-tremor-input hover:dark:bg-dark-tremor-background-muted"
              onClick={() => setIsOpen(false)}
            >
              Go back
            </button>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
