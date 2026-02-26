"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";
import { DEMO_SCENARIOS, AVAILABLE_COUNTRIES, DEFAULT_SCENARIO, type DemoScenario, type MockCountry } from "./mock-data";

interface ScenarioContextType {
  scenario: DemoScenario;
  setScenario: (id: string) => void;
  scenarios: DemoScenario[];
  watchlist: MockCountry[];
  addCountry: (code: string) => void;
  removeCountry: (code: string) => void;
  availableToAdd: MockCountry[];
}

const ScenarioContext = createContext<ScenarioContextType | null>(null);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [baseScenario, setBaseScenario] = useState<DemoScenario>(DEFAULT_SCENARIO);
  const [customCountries, setCustomCountries] = useState<MockCountry[]>([]);
  const [removedCodes, setRemovedCodes] = useState<Set<string>>(new Set());

  const setScenario = (id: string) => {
    const found = DEMO_SCENARIOS.find((s) => s.id === id);
    if (found) {
      setBaseScenario(found);
      setCustomCountries([]);
      setRemovedCodes(new Set());
    }
  };

  const watchlist = [
    ...baseScenario.countries.filter((c) => !removedCodes.has(c.code)),
    ...customCountries,
  ];

  const watchlistCodes = new Set(watchlist.map((c) => c.code));
  const availableToAdd = AVAILABLE_COUNTRIES.filter((c) => !watchlistCodes.has(c.code));

  const addCountry = (code: string) => {
    const country = AVAILABLE_COUNTRIES.find((c) => c.code === code);
    if (country && !watchlistCodes.has(code)) {
      setCustomCountries((prev) => [...prev, country]);
    }
    if (removedCodes.has(code)) {
      setRemovedCodes((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    }
  };

  const removeCountry = (code: string) => {
    setCustomCountries((prev) => prev.filter((c) => c.code !== code));
    if (baseScenario.countries.some((c) => c.code === code)) {
      setRemovedCodes((prev) => new Set(prev).add(code));
    }
  };

  const scenario: DemoScenario = {
    ...baseScenario,
    countries: watchlist,
  };

  return (
    <ScenarioContext.Provider
      value={{
        scenario,
        setScenario,
        scenarios: DEMO_SCENARIOS,
        watchlist,
        addCountry,
        removeCountry,
        availableToAdd,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error("useScenario must be inside ScenarioProvider");
  return ctx;
}
