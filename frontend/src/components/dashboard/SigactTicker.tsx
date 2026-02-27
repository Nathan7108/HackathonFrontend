"use client";

const SIGACT_EVENTS = [
  { dot: "🔴", time: "14:32", country: "UA", text: "Artillery strikes reported near Zaporizhzhia power plant" },
  { dot: "🟠", time: "13:15", country: "IR", text: "IRGC conducts naval exercises in Strait of Hormuz" },
  { dot: "🟡", time: "12:48", country: "PK", text: "Opposition rally in Islamabad draws 50k demonstrators" },
  { dot: "🔴", time: "11:22", country: "ET", text: "Armed clashes in Amhara region displace 12k civilians" },
  { dot: "🟡", time: "09:05", country: "TW", text: "PLA aircraft enter Taiwan ADIZ for 3rd consecutive day" },
  { dot: "🔴", time: "08:30", country: "SD", text: "RSF advances on El Fasher — 200+ casualties reported" },
  { dot: "🟡", time: "07:14", country: "VE", text: "Opposition rally dispersed by security forces in Caracas" },
  { dot: "🟢", time: "05:22", country: "BR", text: "Amazon enforcement operation seizes 40 illegal mining vessels" },
];

const tickerContent = SIGACT_EVENTS.map(
  (e) => `${e.dot} ${e.time} ${e.country} — ${e.text}`
).join("  ·  ");

export function SigactTicker() {
  // Double content for seamless loop
  const doubled = `${tickerContent}  ·  ${tickerContent}`;

  return (
    <div
      className="flex items-center overflow-hidden border-t border-slate-300 bg-gray-50 shrink-0"
      style={{ height: 28 }}
    >
      {/* Label */}
      <div
        className="flex items-center gap-1.5 px-2 shrink-0 border-r border-slate-300"
        style={{ height: "100%" }}
      >
        <span className="relative flex h-2 w-2">
          <span className="light-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">SIGACT</span>
      </div>

      {/* Scrolling content */}
      <div className="flex-1 overflow-hidden">
        <div className="animate-ticker whitespace-nowrap" style={{ fontSize: 11 }}>
          <span className="text-gray-600">{doubled}</span>
        </div>
      </div>
    </div>
  );
}
