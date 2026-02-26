"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  BarChart2,
  Settings,
  Shield,
  Activity,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/globe", icon: Globe, label: "Globe" },
    ],
  },
  {
    label: "Analysis",
    items: [
      { href: "/analysis", icon: BarChart2, label: "Analysis" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { expanded, toggle } = useSidebar();

  return (
    <aside
      className="h-full flex flex-col shrink-0 transition-all duration-300 ease-in-out relative"
      style={{
        width: expanded ? 220 : 64,
        background: "var(--shell-bg)",
      }}
    >
      {/* ─── Logo / Brand ─── */}
      <div className="h-14 flex items-center px-3 shrink-0">
        {expanded ? (
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <Shield size={16} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold tracking-tight" style={{ color: "var(--shell-text-active)" }}>
                Sentinel AI
              </div>
              <div className="text-[10px] font-medium" style={{ color: "var(--shell-text)" }}>
                Threat Intelligence
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <Shield size={17} className="text-white" />
            </div>
          </Link>
        )}
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 overflow-y-auto content-scroll px-2 py-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {/* Section label — only shown when expanded */}
            {expanded && (
              <div
                className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5"
                style={{ color: "var(--shell-text)" }}
              >
                {section.label}
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg transition-all duration-150 group relative"
                    style={{
                      padding: expanded ? "8px 10px" : "8px",
                      justifyContent: expanded ? "flex-start" : "center",
                      background: isActive ? "var(--content-bg)" : "transparent",
                      boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                      color: isActive ? "var(--accent)" : "var(--shell-text)",
                    }}
                    title={expanded ? undefined : item.label}
                  >
                    <Icon
                      size={expanded ? 17 : 19}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    {expanded && (
                      <span
                        className="text-sm transition-opacity duration-200"
                        style={{
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? "var(--shell-text-active)" : "var(--shell-text)",
                        }}
                      >
                        {item.label}
                      </span>
                    )}

                    {/* Active indicator bar */}
                    {isActive && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                        style={{
                          height: 20,
                          background: "var(--accent)",
                        }}
                      />
                    )}

                    {/* Tooltip on hover when collapsed */}
                    {!expanded && (
                      <div className="absolute left-full ml-2 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                        style={{
                          background: "var(--shell-text-active)",
                          color: "white",
                        }}
                      >
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── Bottom Section ─── */}
      <div className="shrink-0 px-2 pb-3 space-y-1">
        {/* Divider */}
        <div className="mx-2 mb-2 border-t" style={{ borderColor: "var(--shell-border)" }} />

        {/* Settings */}
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg transition-all duration-150"
          style={{
            padding: expanded ? "8px 10px" : "8px",
            justifyContent: expanded ? "flex-start" : "center",
            color: pathname === "/settings" ? "var(--accent)" : "var(--shell-text)",
            background: pathname === "/settings" ? "var(--content-bg)" : "transparent",
          }}
          title={expanded ? undefined : "Settings"}
        >
          <Settings size={expanded ? 17 : 19} strokeWidth={1.8} />
          {expanded && <span className="text-sm font-medium">Settings</span>}
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 rounded-lg transition-all duration-150 hover:bg-[var(--shell-bg-hover)]"
          style={{
            padding: expanded ? "8px 10px" : "8px",
            justifyContent: expanded ? "flex-start" : "center",
            color: "var(--shell-text)",
          }}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <PanelLeftClose size={17} strokeWidth={1.8} /> : <PanelLeft size={17} strokeWidth={1.8} />}
          {expanded && <span className="text-sm font-medium">Collapse</span>}
        </button>

        {/* System status */}
        <div
          className="flex items-center gap-2 rounded-lg"
          style={{
            padding: expanded ? "8px 10px" : "8px",
            justifyContent: expanded ? "flex-start" : "center",
          }}
        >
          <div className="relative">
            <Activity size={expanded ? 14 : 16} className="text-green-500" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full live-pulse" />
          </div>
          {expanded && (
            <div>
              <div className="text-[11px] font-medium text-green-600">All Systems Live</div>
              <div className="text-[10px]" style={{ color: "var(--shell-text)" }}>Pipeline active</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
