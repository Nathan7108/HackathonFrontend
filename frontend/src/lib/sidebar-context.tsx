"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const COOKIE_NAME = "sentinel-sidebar-collapsed";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setCollapsedCookie(collapsed: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${collapsed}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

interface SidebarProviderProps {
  children: ReactNode;
  initialCollapsed?: boolean;
}

export function SidebarProvider({ children, initialCollapsed = false }: SidebarProviderProps) {
  const [collapsed, setCollapsedState] = useState(initialCollapsed);

  const setCollapsed = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setCollapsedState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      setCollapsedCookie(next);
      return next;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
