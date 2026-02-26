// Risk level → color mapping
export const RISK_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  ELEVATED: "#f97316",
  HIGH: "#ef4444",
  CRITICAL: "#991b1b",
};

// Risk level → Tailwind class mapping
export const RISK_BG_CLASSES: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MODERATE: "bg-yellow-100 text-yellow-800",
  ELEVATED: "bg-orange-100 text-orange-800",
  HIGH: "bg-red-100 text-red-800",
  CRITICAL: "bg-red-200 text-red-900",
};

// Navigation items (shared with Sidebar)
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/globe", label: "Globe" },
  { href: "/countries", label: "Countries" },
  { href: "/alerts", label: "Alerts" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/forecasts", label: "Forecasts" },
] as const;
