# Sentinel AI Frontend — Progress

## Prompt 1: Application Shell ✅

**Completed:** Project initialization, dependencies, and full application shell (Grey Canvas, White Paper design).

### Done
- [x] Next.js app created in `frontend/` with TypeScript, Tailwind, ESLint, App Router, src-dir
- [x] Installed: mapbox-gl, recharts, lucide-react, clsx (and removed @types/mapbox-gl; using mapbox-gl built-in types)
- [x] Folder structure: `src/app/`, `src/components/shell/`, `src/components/ui/`, `src/lib/`
- [x] **Design:** Grey shell (#eef0f4) — sidebar, header, page background seamless; white content area with rounded-l-xl (right edge straight), shadow-sm, even gutters (p-4), footer strip
- [x] **Shell components:** Sidebar (60px, icon nav, tooltips, LIVE pulse), Header (ScenarioPicker, search, GTI/anomalies, notifications), ContentArea
- [x] **Routes:** `/` → redirect to `/dashboard`; placeholders for globe, countries, country/[code], alerts, intelligence, forecasts
- [x] **Lib:** api.ts (skeleton), types.ts, constants.ts, mock-data.ts, scenario-context.tsx
- [x] **Config:** .env.local with NEXT_PUBLIC_API_URL and NEXT_PUBLIC_MAPBOX_TOKEN
- [x] **Build:** `npm run build` succeeds

---

## Prompt 2: Dashboard + Demo Scenarios ✅

**Completed:** Full dashboard with mock data, demo scenario picker, and 8 widget panels. Zero live API calls.

### Done
- [x] **Mock data** (`src/lib/mock-data.ts`): 3 scenarios — Meridian Energy (Oil & Gas), Pacific Semiconductor (Tech), Atlas Global Logistics (Shipping). Each with countries, alerts, brief, forecast, modelHealth.
- [x] **Scenario context** (`src/lib/scenario-context.tsx`): ScenarioProvider wraps app; useScenario() for active scenario and setScenario(id).
- [x] **Layout:** Children wrapped in ScenarioProvider inside body.
- [x] **ScenarioPicker** (`src/components/shell/ScenarioPicker.tsx`): Dropdown in header with company name, industry badge, click-outside to close. Lists all 3 scenarios with icon, description, “Active” label.
- [x] **Header:** Left = ScenarioPicker; center = search; right = GTI (from scenario.gti, scenario.gtiLevel), anomaly count (alerts where type === "ANOMALY"), timestamp, notification bell with alert count.
- [x] **Dashboard widgets:**  
  - GlobalThreatIndex — half-arc gauge with needle, score, risk badge, Monitored/High+/Anomalies stats  
  - ThreatMap — Mapbox choropleth/markers for watchlist countries (or fallback list if no token)  
  - PriorityBrief — Highest-risk country brief, summary, industry impact, top drivers  
  - AlertFeed — Scrollable alerts with type icon, severity badge, timestamp  
  - TopMovers — Escalating (top 3) and De-escalating (top 3) with arrows  
  - RiskForecast — Sparkline + Now/30d/60d/90d for forecast spotlight country  
  - ModelHealth — Accuracy, features, countries, sources, last trained  
  - EventTicker — Horizontal scrolling SIGACT headlines, pauses on hover  
- [x] **Dashboard page:** 12-column grid — Row 1: GTI (3) + Map (5) + Brief/Forecast (4); Row 2: AlertFeed (5) + TopMovers (4) + ModelHealth (3); Row 3: EventTicker full width. All data from useScenario().
- [x] **CSS:** marker-pulse keyframes (anomaly markers), ticker-scroll keyframes and .animate-ticker (EventTicker). mapbox-gl.css imported in ThreatMap.
- [x] **Verification:** Scenario switch re-renders entire dashboard; header metrics update; no API calls.

---

## Prompt 2c: Enhanced Watchlist + Country Picker ✅

**Completed:** Data-dense watchlist table with inline recharts sparklines, sentiment dots, forecast arrows, and a searchable country picker.

### Done
- [x] **Mock data** (`src/lib/mock-data.ts`): Extended `MockCountry` with `sparkline`, `sentiment`, `forecast30d`, `volatility`. Populated for every country in all 3 scenarios. Added `AVAILABLE_COUNTRIES` (12 extra countries for picker).
- [x] **Scenario context** (`src/lib/scenario-context.tsx`): Watchlist management — `watchlist`, `addCountry`, `removeCountry`, `availableToAdd`. Scenario switch resets custom/removed state.
- [x] **WatchlistTable** (`src/components/dashboard/WatchlistTable.tsx`): Inline recharts sparklines (12wk trend), sentiment colored dots, 30d Δ with arrows, forecast direction (↑/↓/→), risk bar, remove (X) on hover. "Add" button opens searchable country picker dropdown; add/remove updates watchlist immediately.
- [x] **Verification:** Sparklines render (80px column, no axes); sentiment and forecast columns; picker uses AVAILABLE_COUNTRIES; no TS/lint errors.

---

## Prompt 3: Globe Page ✅

**Completed:** Full-screen Mapbox globe with 2D/3D toggle, colored pulsing markers, click popups, and scenario-aware rendering.

### Done
- [x] **`src/app/globe/page.tsx`**: Full-bleed container, renders `<GlobeMap />`
- [x] **`src/components/globe/GlobeMap.tsx`**: Main component — Mapbox init, dynamic marker rendering, 2D/3D toggle, scenario fly-to, popup on click, hover sync between map and country list
- [x] **`src/components/globe/GlobeControls.tsx`**: Top-right overlay — scenario badge (name + country count) and 2D/3D segmented toggle button
- [x] **`src/components/globe/GlobeCountryList.tsx`**: Top-left overlay — watchlist sorted by risk score, colored dots, anomaly pulse icons, hover highlights map marker, click flies to country
- [x] **`src/components/globe/GlobeLegend.tsx`**: Bottom-left overlay — 5 risk level color swatches (Low → Critical)
- [x] **CSS (`globals.css`)**: `@keyframes globe-pulse` for anomaly rings; Mapbox popup overrides (rounded corners, shadow, styled close button)
- [x] **Scenario views**: `SCENARIO_VIEWS` map — Meridian centers on MENA, Pacific on East Asia, Atlas wide global view
- [x] **Markers**: Size scales with risk score, color by risk level, inner dot + outer ring, label with country name + score
- [x] **Anomaly pulse**: Animated ring on countries flagged as anomaly
- [x] **Click popup**: Big risk score, 30d trend arrow, forecast/sentiment/volatility stats, top headline, anomaly warning
- [x] **Hover effects**: Scale-up + glow on marker hover; synced with country list hover
- [x] **Token guard**: Shows placeholder UI if NEXT_PUBLIC_MAPBOX_TOKEN is not set

---

## Prompt 4: Sidebar + Header Upgrade ✅

**Completed:** Premium expandable sidebar, upgraded header with search and metrics, shared sidebar context.

### Done
- [x] **SidebarContext** (`src/components/shell/SidebarContext.tsx`): Shared state `expanded` / `setExpanded` / `toggle`; sidebar defaults to collapsed (64px).
- [x] **Sidebar** (`src/components/shell/Sidebar.tsx`): Expandable 64px ↔ 220px with 300ms transition; branded header (Sentinel AI + Threat Intelligence when expanded, shield icon when collapsed); nav grouped into Overview, Intelligence, Analysis with section labels when expanded; active page has blue left-bar indicator; Settings link, Collapse/Expand button, All Systems Live status at bottom; tooltips on collapsed icons.
- [x] **Header** (`src/components/shell/Header.tsx`): Page title + breadcrumb, ScenarioPicker, center search (button that expands to input with Cmd+K / Ctrl+K, Escape to close); search filters countries by name/code with dropdown results; GTI badge with colored tint, high+ count, anomaly count, last updated, notification bell.
- [x] **Layout** (`src/app/layout.tsx`): SidebarProvider from `@/components/shell/SidebarContext` wraps shell; content area `p-3 pt-0`, rounded-xl white surface.
- [x] **Settings** (`src/app/settings/page.tsx`): Placeholder page for organization config, watchlist, alerts, API keys.
- [x] **globals.css**: `aside { will-change: width }` for smooth sidebar transition; `[title] { position: relative }` for tooltips.
- [x] Verification: Sidebar starts collapsed; toggle in sidebar; section labels only when expanded; header search with shortcut and filter; content area adjusts smoothly; no TS/console errors.

---

## Prompt 3b: Globe Page Upgrade ✅

**Completed:** Slide-out country detail panel, customer asset overlays, trade route lines, cleaned-up choropleth, risk-tier grouped left panel with sparklines.

### Done
- [x] **`src/lib/mock-data.ts`**: Added `CustomerAsset` and `TradeRoute` interfaces; `assets` and `routes` arrays on all 3 scenarios (Meridian: refineries/pipelines, Pacific: fabs/supply chain, Atlas: ports/trade routes)
- [x] **`src/components/globe/GlobeMap.tsx`**: Full rewrite — selected country state, no Mapbox popups, `renderAssetMarkers()` for emoji facility/port markers, `renderTradeRoutes()` for dashed colored lines, choropleth now only colors watchlist countries (others `#e8eaed`), clicking canvas closes panel
- [x] **`src/components/globe/CountryDetailPanel.tsx`**: New 400px slide-out right panel — big score, risk badge, trend, 12-week sparkline, stats grid (forecast/sentiment/volatility), key signal bullets, intelligence brief, industry impact callout, nearby customer assets with risk warnings, headlines, forecast row, "View Full Analysis →" CTA
- [x] **`src/components/globe/GlobeCountryList.tsx`**: Risk tier grouping (CRITICAL → LOW), selected state (colored left border + tinted bg), mini sparklines per country row, anomaly radio pulse icon
- [x] **`src/app/globals.css`**: Added `slide-in-right` keyframes

---

## Prompt 5: Transpara-Grade Dashboard Rebuild ✅

**Completed:** Full dashboard rebuilt from scratch with Transpara-level information density. Zero wasted space, 8+ visualizations, LIVE badges everywhere, monospace numbers, color-as-data throughout.

### Done
- [x] **`src/lib/placeholder-data.ts`**: New file — `CountryData` interface + `WATCHLIST_COUNTRIES` (8 real countries: UA, IR, PK, ET, VE, TW, RS, BR + 2 placeholders), `ACTIVE_COUNTRIES` filtered/sorted array
- [x] **`src/lib/dashboard-data.ts`**: New file — `RISK_DISTRIBUTION`, `REGIONAL_BREAKDOWN`, `SENTIMENT_TREND_30D`, `MODEL_PERFORMANCE`, `TOP_ESCALATING`, `TOP_DEESCALATING`, `KPI_SPARKLINE_DATA`
- [x] **`StatusBar.tsx`**: 28px dark strip — pulsing red LIVE dot, brand name, 6 green source dots, pipeline health, last updated, feature/model/data stats
- [x] **`KpiStrip.tsx`**: 6-column KPI grid — Global Threat Index (amber), Active Anomalies (red), HIGH+ Countries (red), Escalation Alerts (orange), Model Accuracy (green), Sources Active (blue dots). Each with inline SVG sparkline, delta badge, colored left border.
- [x] **`Sparkline.tsx`**: Pure SVG sparkline — no recharts overhead. Supports optional filled area at 10% opacity.
- [x] **`WatchlistTable.tsx`**: Dense 8-country table — rank, flag+name, score with proportional fill-bar overlay, Δ30d colored delta, level abbreviation badge, 40px trend sparkline, sentiment dot, anomaly ⚠. Rows link to `/country/[code]`. Escalation movers footer.
- [x] **`ThreatMap.tsx`**: Mapbox GL map (if token present) with colored markers sized by risk score, pulsing animation on anomaly countries. SVG world-map fallback with equirectangular projection dots. Time window selector pills (24h/7d/30d/90d). Floating legend + country count.
- [x] **`IntelPanel.tsx`**: 3-tab panel — Brief (hero score, sub-scores, brief text, ML drivers, CTA link), Headlines (8 mock headlines with sentiment dots + timestamps), Forecast (recharts AreaChart with historical + dashed forecast + confidence band + ReferenceLine for TODAY + 30/60/90d values).
- [x] **`AlertFeed.tsx`**: 8 mock alerts — timestamp (mono), severity dot, type badge (ANOMALY/ESCALATION/THRESHOLD/FORECAST), description, country tag. LIVE badge + active count in header.
- [x] **`AnalyticsGrid.tsx`**: 2×2 mini charts — Risk Distribution (horizontal CSS bars colored by risk level), Regional Breakdown (6 regions with colored bars + anomaly count), Media Sentiment (recharts PieChart donut with dominant % label), Model Health (recharts LineChart 12wk accuracy + stats).
- [x] **`SigactTicker.tsx`**: 28px SIGACT ticker — red LIVE dot label, CSS `animate-ticker` scrolling 8 events with colored emoji dots, mono timestamps, country codes.
- [x] **`src/app/dashboard/page.tsx`**: Rewritten — StatusBar pinned top, scrollable content with gap-1.5 rows (KpiStrip, 12-col main grid 4/5/3, bottom grid 5/7), SigactTicker pinned bottom.
- [x] **Build**: `npm run build` passes with zero errors. Dashboard renders at `/dashboard` with HTTP 200.
- [x] Deleted old components: TopMovers, GlobalThreatIndex, RiskForecast, ModelHealth, PriorityBrief

---

## Prompt 6: Globe Page Rebuild — Clean Intelligence Map ✅

**Completed:** Full rebuild of the Globe page as a professional intelligence map. Removed all circle/bubble markers; choropleth fill is the only country visualization. Left panel is a clean 240px flex sibling (not an overlay). Right detail panel slides in on country click. Controls and legend are clean floating elements.

### Done
- [x] **`src/app/globe/page.tsx`**: Rewritten — flex layout (`GlobeLeftPanel` + map area + floating panels). Manages `selectedCode`, `leftPanelOpen`, `layers`, `is3D` state. Uses `dynamic(() => import('GlobeMap'), { ssr: false })` for SSR safety.
- [x] **`src/components/globe/GlobeMap.tsx`**: Complete rewrite — no circle markers, no numbered bubbles, no pulsing rings. Choropleth fill using `EXPANDED_RISK_FILL` (28 countries colored by risk level). Hover popup via Mapbox Popup API showing flag + score + level. Click fires `onCountrySelect`. Selected country gets blue 2.5px border highlight + flyTo. Style: `light-v11`. Center `[30, 25]`, zoom `2`, mercator projection. Both named and default export.
- [x] **`src/components/globe/GlobeLeftPanel.tsx`**: New component — 3 clear sections: (1) Layers: 5 checkbox rows with colored dot indicators; (2) Watchlist: scrollable list sorted by risk score, flag + name + score + dot, selected state with blue left border; (3) Anomalies: compact alert rows for `anomaly.detected === true` countries with ⚠ icon + score + severity pill.
- [x] **`src/components/globe/GlobeControls.tsx`**: Updated — clean segmented controls. Time window: 24h/7d/30d/90d (was 1h/6h/24h/7d/All). 2D/3D toggle. Both groups use `bg-white/92 backdrop-blur-sm rounded-md` styling.
- [x] **`src/components/globe/GlobeDetailPanel.tsx`**: New component using `CountryData` from `placeholder-data.ts`. Shows: score ring, sub-scores bars, intel brief, forecast grid (30/60/90d), causal chain (numbered steps), feature importance bars, headlines, "VIEW FULL ANALYSIS" CTA.
- [x] **`src/components/globe/GlobeLegend.tsx`**: Kept as-is (already correct — 5 risk level swatches, bottom-left).
- [x] **`globals.css`**: Added `.sentinel-popup` styles for clean Mapbox popup (6px border-radius, shadow, hidden tip arrow).
- [x] **Deleted**: `GlobeCountryList.tsx`, `GlobeLayerToggles.tsx`, `CountryDetailPanel.tsx`
- [x] **Build**: `npm run build` passes with zero errors.

---

## Prompt 5b: Dashboard Density Fix ✅

**Completed:** Killed all white space, fixed right-edge clipping, map now always shows SVG canvas, watchlist fills full height.

### Done
- [x] **`page.tsx`**: `px-3 py-1.5 space-y-1` — 12px horizontal padding eliminates right-edge clipping; tighter vertical gaps
- [x] **`WatchlistTable.tsx`**: Row height reduced to 26px; added "Aggregate Sub-Scores" (3 colored progress bars) + "Top Risk Drivers" (mono tag pills) section below escalation movers — fills the full card height with useful ML data
- [x] **`ThreatMap.tsx`**: SVG world canvas (`SvgWorldCanvas`) now ALWAYS renders as the base layer. Continent blobs (gray ellipses), grid lines, colored risk dots with country codes + score labels, pulsing rings for anomaly countries. Mapbox overlays on top if token present (opacity transition). Every judge sees a real map visualization.
- [x] **`KpiStrip.tsx`**: `gap-1` grid, `px-2.5 py-1.5` cards, `text-xl` values, sparklines enlarged to `52×20`, inline delta on same line as value
- [x] **`AnalyticsGrid.tsx`**: `overflow-hidden` on all cards; Regional Breakdown uses abbreviations ("Mid. East", "Sub-Sahara") + fixed-width columns + `max-w-[80px]` bar + `shrink-0` values; `gap-1` grid tightened
- [x] **`IntelPanel.tsx`**: `pr-3` on tab content, `leading-relaxed` on brief text, `mt-2 block` on CTA link
- [x] **`StatusBar.tsx`**: `pr-4` + `overflow-hidden` prevents right-side text clipping
- [x] **`AlertFeed.tsx`**: `scrollbar-thin` class for styled 4px scrollbar
- [x] **`globals.css`**: Added `.tabular-nums` utility and `.scrollbar-thin` webkit scrollbar styles

---

## Prompt 7: Globe Visual Density — Atlas to Intelligence Platform ✅

**Completed:** Upgraded globe from single-layer choropleth into a multi-layer intelligence monitoring surface with muted basemap styling, event-level activity, scenario infrastructure overlays, and panel/control layout fixes.

### Done
- [x] **`src/components/globe/GlobeMap.tsx`**: Added muted style overrides (`land` + `water` + de-emphasized labels), removed blue selected outline and replaced with white `country-highlight` stroke, kept choropleth risk fill, and improved hover popup readability.
- [x] **`src/components/globe/GlobeMap.tsx`**: Added new intelligence layers — conflict event heat/dot points, dashed trade routes (3), facility markers + labels (5), and animated anomaly pulse layer using `requestAnimationFrame`.
- [x] **`src/components/globe/GlobeMap.tsx` + `src/app/globe/page.tsx`**: Wired left-panel layer toggles to map layer visibility and added bottom-right live status badge (`37 events · 5 anomalies · 201 countries`).
- [x] **`src/components/globe/GlobeControls.tsx`**: Restructured controls into separated stacked groups with dark active state (`bg-slate-800 text-white`) to avoid overlap and improve state clarity.
- [x] **`src/components/globe/GlobeLeftPanel.tsx`**: Fixed vertical layout behavior (`h-full overflow-hidden flex flex-col`), added section separators, ensured watchlist scrolls (`flex-1 overflow-y-auto`), and constrained anomalies list (`max-h-[160px] overflow-y-auto`).
- [x] **`src/app/globals.css`**: Updated `.sentinel-popup` styling for polished hover popup content/tip treatment.

---

## Prompt 8: Complete Globe Page Redesign — Dense Sidebar + Layered Map ✅

**Completed:** Full redesign of the globe page — 6-section dense sidebar filling 100% height with zero white gaps, expanded map layers (25+ countries, events, routes, facilities, pulse), legend with layer indicators, tighter detail panel, live status badge.

### Done
- [x] **`src/components/globe/GlobeLeftPanel.tsx`**: Complete rewrite — 6 dense sections: (1) Layers with counts per layer, (2) Watchlist table with flag + name + score + delta + colored risk bar + anomaly indicator + escalation movers, (3) Recent Activity feed (10 scrollable events with timestamps + LIVE badge), (4) Anomaly Alerts (5 countries with score bars + severity badges), (5) Global Sentiment (stacked bar + 7-day sparkline trend), (6) Data Sources footer (6 sources with green status dots + last-update times). Width 280px, zero white gaps.
- [x] **`src/components/globe/GlobeMap.tsx`**: Expanded `EXPANDED_RISK_FILL` to 31 countries including ML, HT, CF, MX, SA, AE, KZ. Updated water color to `#e8ecf1`. Risk score lookup expanded to match.
- [x] **`src/components/globe/GlobeLegend.tsx`**: Added layer indicator row below risk colors — Events (red dot), Facilities (blue dot), Trade Routes (dashed indigo line).
- [x] **`src/components/globe/GlobeDetailPanel.tsx`**: Tighter header with 28px score + risk badge + delta arrow inline. Added Quick Stats bar (`Confidence | Events 24h | Anomaly`). Sub-scores use per-type colors (red/orange/yellow). Headlines show sentiment dots + timestamps. Section headers use 9px uppercase tracking-widest.
- [x] **`src/app/globe/page.tsx`**: Status badge moved to `bottom-3 right-3`, added LIVE label.
- [x] **Build**: `npm run build` passes with zero errors.

---

## Prompt 9: Globe Page Layout — Bottom Intelligence Panel ✅

**Completed:** Restructured globe page into a scrollable two-row layout: top row is left panel + map side by side (60vh), bottom row is a full-width intelligence panel with 4 card columns. Left panel slimmed to map-relevant content; analytical sections moved to bottom panel with additional data.

### Done
- [x] **`src/app/globe/page.tsx`**: Page layout changed from `flex h-full overflow-hidden` (no scroll) to `flex flex-col h-full overflow-y-auto` (scrollable). Top row: left panel + map at `60vh / min 480px`. Bottom row: `<GlobeBottomPanel />` spanning full width. Right detail panel still slides in over map on country click.
- [x] **`src/components/globe/GlobeLeftPanel.tsx`**: Slimmed from 6 sections to 3 — Layers (checkboxes + counts), Watchlist (table with score bars + deltas + escalation movers), Data Sources footer. Width reduced to 260px. Activity feed, anomalies, and sentiment moved to bottom panel.
- [x] **`src/components/globe/GlobeBottomPanel.tsx`**: New full-width component — 12-col grid with 4 card groups: (1) Recent Activity feed (14 events, LIVE badge, event type tags), (2) Anomaly Alerts + Escalation Movers (top 5 up + down), (3) Global Sentiment (stacked bar + 7d/30d sparklines) + Regional Breakdown (6 regions with risk bars + anomaly counts), (4) Risk Distribution (5-tier bars) + Model Health (accuracy sparkline + version/features/countries/sources stats).
- [x] **Build**: `npm run build` passes with zero errors.
