"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SidebarContextType {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false); // collapsed by default

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggle: () => setExpanded((v) => !v) }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be inside SidebarProvider");
  return ctx;
}
