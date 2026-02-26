"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import { WATCHLIST_COUNTRIES } from "@/lib/placeholder-data";
import type { GlobeLayerState } from "@/components/globe/GlobeLeftPanel";

const RISK_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  ELEVATED: "#ea580c",
  HIGH: "#ef4444",
  CRITICAL: "#991b1b",
};

// Countries to show on choropleth with their risk color (25+ countries)
const EXPANDED_RISK_FILL: Record<string, string> = {
  // Watchlist (8)
  UA: "#dc2626", IR: "#dc2626", PK: "#ea580c", ET: "#ea580c",
  VE: "#eab308", TW: "#eab308", RS: "#22c55e", BR: "#22c55e",
  // Critical/High
  IQ: "#dc2626", SY: "#b91c1c", YE: "#dc2626", SD: "#b91c1c",
  AF: "#dc2626", MM: "#dc2626", SO: "#dc2626",
  // Elevated
  LY: "#ea580c", NG: "#ea580c", CD: "#ea580c", ML: "#ea580c",
  HT: "#ea580c", CF: "#ea580c",
  // Moderate
  CN: "#eab308", RU: "#eab308", KP: "#eab308", MX: "#eab308",
  // Low
  US: "#22c55e", GB: "#22c55e", DE: "#22c55e", FR: "#22c55e",
  JP: "#22c55e", AU: "#22c55e", CA: "#22c55e", IN: "#22c55e",
  SA: "#86efac", AE: "#86efac", KZ: "#86efac",
};

// Approx centers [lng, lat] for fly-to
const COUNTRY_CENTERS: Record<string, [number, number]> = {
  UA: [30.5, 48.4], IR: [53.7, 32.4], PK: [69.3, 30.4], ET: [40.5, 9.1],
  VE: [-66.6, 6.4], TW: [120.9, 23.7], RS: [21.0, 44.0], BR: [-51.9, -14.2],
  IQ: [43.7, 33.2], SY: [38.9, 34.8], YE: [48.5, 15.6], SD: [30.2, 12.9],
  AF: [67.7, 33.9], MM: [95.9, 16.9], LY: [17.2, 26.3], SO: [46.2, 5.2],
  NG: [8.7, 9.1],  CD: [23.7, -4.0],
  CN: [104.2, 35.9], RU: [37.6, 55.8], KP: [127.8, 40.0],
  IN: [78.9, 20.6], US: [-95.7, 37.1], DE: [10.5, 51.2], GB: [-3.4, 55.4],
  JP: [139.7, 36.2], AU: [133.8, -25.3], CA: [-96.8, 56.1], FR: [2.2, 46.2],
};

const GEOJSON_PRIMARY = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";
const GEOJSON_FALLBACK = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

interface Props {
  onCountrySelect: (code: string) => void;
  selectedCode: string | null;
  is3D?: boolean;
  layers?: GlobeLayerState;
}

const RISK_SCORE_BY_CODE: Record<string, number> = {
  UA: 87, IR: 79, ET: 68, TW: 72, PK: 62, VE: 55, RS: 38, BR: 28,
  IQ: 77, SY: 88, YE: 83, SD: 81, AF: 64, MM: 61, LY: 58, SO: 60,
  NG: 57, CD: 69, CN: 46, RU: 52, KP: 49, IN: 34, US: 31, DE: 22,
  GB: 26, JP: 20, AU: 18, CA: 19, FR: 25,
  ML: 56, HT: 59, CF: 63, MX: 42, SA: 30, AE: 24, KZ: 29,
};

const CONFLICT_EVENTS = [
  { lng: 37.8, lat: 48.0, intensity: 0.9, type: "battle" },
  { lng: 36.2, lat: 49.0, intensity: 0.8, type: "explosion" },
  { lng: 35.0, lat: 47.8, intensity: 0.7, type: "battle" },
  { lng: 34.5, lat: 48.5, intensity: 0.85, type: "battle" },
  { lng: 38.0, lat: 47.0, intensity: 0.6, type: "explosion" },
  { lng: 37.0, lat: 48.3, intensity: 0.95, type: "battle" },
  { lng: 38.5, lat: 47.5, intensity: 0.7, type: "explosion" },
  { lng: 43.7, lat: 33.3, intensity: 0.8, type: "battle" },
  { lng: 44.4, lat: 33.0, intensity: 0.7, type: "explosion" },
  { lng: 42.5, lat: 35.5, intensity: 0.6, type: "battle" },
  { lng: 36.3, lat: 34.8, intensity: 0.75, type: "battle" },
  { lng: 44.2, lat: 15.3, intensity: 0.85, type: "battle" },
  { lng: 45.0, lat: 14.8, intensity: 0.7, type: "explosion" },
  { lng: 44.0, lat: 13.5, intensity: 0.6, type: "battle" },
  { lng: 32.5, lat: 15.6, intensity: 0.9, type: "battle" },
  { lng: 33.0, lat: 13.2, intensity: 0.75, type: "battle" },
  { lng: 25.3, lat: 13.8, intensity: 0.8, type: "battle" },
  { lng: 38.7, lat: 9.0, intensity: 0.6, type: "battle" },
  { lng: 39.5, lat: 11.5, intensity: 0.65, type: "battle" },
  { lng: 70.0, lat: 33.0, intensity: 0.5, type: "explosion" },
  { lng: 67.0, lat: 25.4, intensity: 0.4, type: "protest" },
  { lng: 71.5, lat: 34.0, intensity: 0.55, type: "battle" },
  { lng: 96.2, lat: 19.8, intensity: 0.7, type: "battle" },
  { lng: 97.0, lat: 21.0, intensity: 0.6, type: "battle" },
  { lng: 96.5, lat: 16.8, intensity: 0.5, type: "explosion" },
  { lng: 45.3, lat: 2.0, intensity: 0.7, type: "battle" },
  { lng: 44.1, lat: 9.5, intensity: 0.5, type: "explosion" },
  { lng: 13.1, lat: 11.8, intensity: 0.6, type: "battle" },
  { lng: 7.5, lat: 9.1, intensity: 0.4, type: "protest" },
  { lng: 13.2, lat: 32.9, intensity: 0.5, type: "battle" },
  { lng: 15.1, lat: 32.4, intensity: 0.45, type: "explosion" },
  { lng: 29.2, lat: -1.7, intensity: 0.75, type: "battle" },
  { lng: 28.8, lat: -2.5, intensity: 0.6, type: "battle" },
  { lng: 69.2, lat: 34.5, intensity: 0.65, type: "explosion" },
  { lng: 65.7, lat: 31.6, intensity: 0.5, type: "battle" },
  { lng: 67.8, lat: 32.1, intensity: 0.55, type: "battle" },
];

const TRADE_ROUTES: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Persian Gulf -> Suez", type: "oil" },
      geometry: {
        type: "LineString",
        coordinates: [
          [56.0, 26.5], [57.5, 25.5], [58.5, 23.5], [55.0, 21.0],
          [50.0, 16.0], [44.0, 13.0], [43.2, 12.5], [43.5, 14.0],
          [42.0, 19.0], [35.5, 28.0], [32.3, 30.0],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Caspian Pipeline", type: "pipeline" },
      geometry: {
        type: "LineString",
        coordinates: [
          [51.0, 40.0], [49.5, 40.5], [46.0, 41.5], [43.0, 41.0],
          [40.0, 39.5], [36.0, 37.0], [35.0, 36.5],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Red Sea Route", type: "oil" },
      geometry: {
        type: "LineString",
        coordinates: [
          [32.3, 30.0], [33.8, 28.0], [35.5, 24.0], [38.0, 19.0],
          [42.0, 15.0], [43.3, 12.6],
        ],
      },
    },
  ],
};

const SCENARIO_FACILITIES = [
  { name: "Rumaila Field Ops", lng: 47.3, lat: 30.5, type: "extraction" },
  { name: "Tengiz Pipeline Hub", lng: 53.1, lat: 46.2, type: "pipeline" },
  { name: "Yanbu Terminal", lng: 38.1, lat: 24.1, type: "terminal" },
  { name: "Dubai Regional HQ", lng: 55.3, lat: 25.2, type: "office" },
  { name: "Jamnagar Refinery", lng: 70.1, lat: 22.5, type: "refinery" },
];

function normalizeISO(props: Record<string, unknown>): string {
  const raw = String(props.ISO_A2 ?? props.iso_a2 ?? "").trim().toUpperCase();
  if (raw.length === 2 && !raw.startsWith("-")) return raw;
  // ADM0_A3 fallback for disputed/unrecognized territories
  const adm = String(props.ADM0_A3 ?? "").trim();
  if (adm === "TWN") return "TW";
  if (adm === "KOS") return "XK";
  if (adm === "PSX") return "PS";
  // Name-based fallback
  const name = String(props.NAME ?? props.name_en ?? "").toLowerCase();
  if (name.includes("taiwan")) return "TW";
  return "";
}

function GlobeMap({ onCountrySelect, selectedCode, is3D = false, layers }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const onCountrySelectRef = useRef(onCountrySelect);
  const layersReadyRef = useRef(false);
  const pendingCodeRef = useRef<string | null>(null);
  const pulseFrameRef = useRef<number | null>(null);
  const pulseRunningRef = useRef(false);

  // Keep callback ref current
  useEffect(() => {
    onCountrySelectRef.current = onCountrySelect;
  });

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || token === "your_mapbox_token_here") return;

    import("mapbox-gl").then((mb) => {
      const gl = mb.default || mb;
      (gl as any).accessToken = token;

      const map = new gl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center: [30, 25] as [number, number],
        zoom: 2,
        projection: "mercator" as any,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
      });

      // Softer, more realistic base — not pure white; subtle blue water and warm land
      map.on("style.load", () => {
        try {
          map.setPaintProperty("background", "background-color", "#e8e6e0");
        } catch { /* optional */ }
        try {
          map.setPaintProperty("land", "background-color", "#e2e0d9");
        } catch { /* layer can vary by style version */ }
        try {
          map.setPaintProperty("landcover", "fill-color", "#e2e0d9");
        } catch { /* optional */ }
        try {
          map.setPaintProperty("water", "fill-color", "#a8bed5");
        } catch { /* layer can vary by style version */ }
        try {
          map.setPaintProperty("waterway", "line-color", "#9cb4cc");
        } catch { /* optional */ }

        const labelLayers = map
          .getStyle()
          .layers?.filter((l: any) => l.id.includes("label") || l.id.includes("place"));
        labelLayers?.forEach((l: any) => {
          try { map.setPaintProperty(l.id, "text-color", "#6b7280"); } catch { /* layer type mismatch */ }
          try { map.setPaintProperty(l.id, "text-opacity", 0.65); } catch { /* layer type mismatch */ }
        });
      });

      map.addControl(new gl.NavigationControl({ showCompass: false }), "bottom-right");

      const popup = new gl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: "sentinel-popup",
        offset: 5,
      });

      map.on("load", () => {
        setupChoropleth(map, popup);
      });

      mapRef.current = map;
    });

    return () => {
      layersReadyRef.current = false;
      pulseRunningRef.current = false;
      if (pulseFrameRef.current !== null) {
        cancelAnimationFrame(pulseFrameRef.current);
        pulseFrameRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // selectedCode → highlight + fly-to
  useEffect(() => {
    if (!mapRef.current) return;
    if (!layersReadyRef.current) {
      pendingCodeRef.current = selectedCode;
      return;
    }
    applySelection(mapRef.current, selectedCode);
  }, [selectedCode]);

  // 2D/3D toggle
  useEffect(() => {
    if (!mapRef.current) return;
    try {
      mapRef.current.setProjection(is3D ? "globe" : "mercator");
    } catch { /* not loaded yet */ }
  }, [is3D]);

  useEffect(() => {
    if (!mapRef.current || !layersReadyRef.current || !layers) return;
    const map = mapRef.current;
    const visibility = (show: boolean) => (show ? "visible" : "none");
    const setVisibility = (layerId: string, show: boolean) => {
      try {
        map.setLayoutProperty(layerId, "visibility", visibility(show));
      } catch { /* layer may not be ready yet */ }
    };
    setVisibility("conflict-events-heat", layers.conflictZones);
    setVisibility("conflict-events-dot", layers.conflictZones);
    setVisibility("trade-routes-line", layers.tradeRoutes);
    setVisibility("facility-markers", layers.facilities);
    setVisibility("facility-labels", layers.facilities);
    setVisibility("anomaly-pulse", layers.anomalyAlerts);
    setVisibility("country-border", layers.infrastructure);
  }, [layers]);

  function applySelection(map: any, code: string | null) {
    try {
      if (code) {
        map.setFilter("country-highlight", ["==", ["get", "_iso"], code]);
        map.setPaintProperty("country-highlight", "line-opacity", 1);
      } else {
        map.setPaintProperty("country-highlight", "line-opacity", 0);
      }
    } catch { /* layer not ready */ }
    if (code && COUNTRY_CENTERS[code]) {
      map.flyTo({ center: COUNTRY_CENTERS[code], zoom: 4, duration: 800, essential: true });
    }
  }

  function setupChoropleth(map: any, popup: any) {
    const processGeo = (geo: GeoJSON.FeatureCollection) => {
      const data: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: geo.features.map((f) => {
          const props = { ...(f.properties ?? {}) } as Record<string, unknown>;
          const iso = normalizeISO(props);
          const fillColor = EXPANDED_RISK_FILL[iso] ?? "#d8d6d0";
          const isRisk = iso in EXPANDED_RISK_FILL ? 1 : 0;
          const isWatchlist = WATCHLIST_COUNTRIES.some((c) => c.code === iso) ? 1 : 0;
          const score = RISK_SCORE_BY_CODE[iso] ?? null;
          return { ...f, properties: { ...props, _iso: iso, _fill: fillColor, _risk: isRisk, _wl: isWatchlist, _score: score } };
        }),
      };

      map.addSource("countries", { type: "geojson", data });

      // Fill layer — only visible for risk countries
      map.addLayer({
        id: "country-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": ["get", "_fill"],
          "fill-opacity": [
            "case",
            ["==", ["get", "_wl"], 1], 0.80,
            ["==", ["get", "_risk"], 1], 0.55,
            0.0,
          ],
        },
      });

      // Subtle border for all countries
      map.addLayer({
        id: "country-border",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "#94a3b8",
          "line-width": ["case", ["==", ["get", "_risk"], 1], 0.6, 0.3],
          "line-opacity": 0.5,
        },
        layout: { visibility: layers?.infrastructure ? "visible" : "none" },
      });

      // Selected country highlight ring (white, not blue)
      map.addLayer({
        id: "country-highlight",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "#ffffff",
          "line-width": 2.5,
          "line-opacity": 0,
        },
        filter: ["==", ["get", "_iso"], ""],
      });

      map.addSource("conflict-events", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: CONFLICT_EVENTS.map((e, i) => ({
            type: "Feature" as const,
            properties: { intensity: e.intensity, type: e.type, id: i },
            geometry: { type: "Point" as const, coordinates: [e.lng, e.lat] },
          })),
        },
      });

      map.addLayer({
        id: "conflict-events-heat",
        type: "circle",
        source: "conflict-events",
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["get", "intensity"],
            0.3, 3,
            0.6, 5,
            0.9, 8,
          ],
          "circle-color": [
            "match", ["get", "type"],
            "battle", "#dc2626",
            "explosion", "#ea580c",
            "protest", "#eab308",
            "#dc2626",
          ],
          "circle-opacity": 0.45,
          "circle-blur": 0.4,
        },
        layout: { visibility: layers?.conflictZones === false ? "none" : "visible" },
      });

      map.addLayer({
        id: "conflict-events-dot",
        type: "circle",
        source: "conflict-events",
        paint: {
          "circle-radius": 2,
          "circle-color": [
            "match", ["get", "type"],
            "battle", "#dc2626",
            "explosion", "#ea580c",
            "protest", "#eab308",
            "#dc2626",
          ],
          "circle-opacity": 0.8,
        },
        layout: { visibility: layers?.conflictZones === false ? "none" : "visible" },
      });

      map.addSource("trade-routes", {
        type: "geojson",
        data: TRADE_ROUTES,
      });

      map.addLayer({
        id: "trade-routes-line",
        type: "line",
        source: "trade-routes",
        paint: {
          "line-color": "#6366f1",
          "line-width": 1.5,
          "line-dasharray": [4, 3],
          "line-opacity": 0.6,
        },
        layout: { visibility: layers?.tradeRoutes ? "visible" : "none" },
      });

      map.addSource("facilities", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: SCENARIO_FACILITIES.map((f) => ({
            type: "Feature" as const,
            properties: { name: f.name, type: f.type },
            geometry: { type: "Point" as const, coordinates: [f.lng, f.lat] },
          })),
        },
      });

      map.addLayer({
        id: "facility-markers",
        type: "circle",
        source: "facilities",
        paint: {
          "circle-radius": 5,
          "circle-color": "#2563eb",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
          "circle-opacity": 0.9,
        },
        layout: { visibility: layers?.facilities === false ? "none" : "visible" },
      });

      map.addLayer({
        id: "facility-labels",
        type: "symbol",
        source: "facilities",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 10,
          "text-offset": [0, 1.5],
          "text-anchor": "top",
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          visibility: layers?.facilities === false ? "none" : "visible",
        },
        paint: {
          "text-color": "#1e40af",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });

      const anomalyCountries = WATCHLIST_COUNTRIES
        .filter((c) => c.anomaly.detected)
        .map((c) => ({
          code: c.code,
          lng: COUNTRY_CENTERS[c.code]?.[0] ?? c.longitude ?? 0,
          lat: COUNTRY_CENTERS[c.code]?.[1] ?? c.latitude ?? 0,
          severity: c.anomaly.severity,
        }))
        .filter((c) => c.lng !== 0 || c.lat !== 0);

      map.addSource("anomaly-pulse", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: anomalyCountries.map((a) => ({
            type: "Feature" as const,
            properties: { code: a.code, severity: a.severity },
            geometry: { type: "Point" as const, coordinates: [a.lng, a.lat] },
          })),
        },
      });

      map.addLayer({
        id: "anomaly-pulse",
        type: "circle",
        source: "anomaly-pulse",
        paint: {
          "circle-radius": 15,
          "circle-color": "transparent",
          "circle-stroke-color": "#ef4444",
          "circle-stroke-width": 1.5,
          "circle-stroke-opacity": 0.6,
        },
        layout: { visibility: layers?.anomalyAlerts === false ? "none" : "visible" },
      });

      pulseRunningRef.current = true;
      let pulsePhase = 0;
      const animatePulse = () => {
        if (!pulseRunningRef.current) return;
        pulsePhase = (pulsePhase + 0.02) % 1;
        const sin = Math.sin(pulsePhase * Math.PI * 2);
        const radius = 12 + sin * 6;
        const opacity = 0.3 + sin * 0.3;
        try {
          map.setPaintProperty("anomaly-pulse", "circle-radius", radius);
          map.setPaintProperty("anomaly-pulse", "circle-stroke-opacity", opacity);
        } catch { /* map/style may be unloading */ }
        pulseFrameRef.current = requestAnimationFrame(animatePulse);
      };
      pulseFrameRef.current = requestAnimationFrame(animatePulse);

      layersReadyRef.current = true;

      // Apply any pending selection (set before layers were ready)
      if (pendingCodeRef.current !== null) {
        applySelection(map, pendingCodeRef.current);
        pendingCodeRef.current = null;
      }

      // ── Hover popup ──────────────────────────────────────────────
      let lastCode: string | null = null;

      map.on("mousemove", "country-fill", (e: any) => {
        const feat = e.features?.[0];
        if (!feat) return;
        const iso = feat.properties?._iso as string;
        if (!iso || !(iso in EXPANDED_RISK_FILL)) return;

        map.getCanvas().style.cursor = "pointer";

        if (iso !== lastCode) {
          lastCode = iso;
          const wl = WATCHLIST_COUNTRIES.find((c) => c.code === iso);
          let html: string;
          if (wl) {
            const col = RISK_COLORS[wl.riskLevel] ?? "#6b7280";
            html = `
              <div style="font:600 12px Inter,system-ui,sans-serif;color:#111827">
                ${wl.flag} ${wl.name}
              </div>
              <div style="font:500 11px Inter,system-ui,sans-serif;margin-top:3px">
                <b style="color:${col}">${wl.riskScore}</b>
                <span style="color:#9ca3af"> · ${wl.riskLevel}</span>
              </div>`;
          } else {
            const name =
              feat.properties?.NAME ??
              feat.properties?.name_en ??
              feat.properties?.NAME_EN ??
              iso;
            const score = feat.properties?._score;
            html = `
              <div style="font:600 12px Inter,system-ui,sans-serif;color:#111827">${name}</div>
              <div style="font:500 11px Inter,system-ui,sans-serif;margin-top:3px">
                <b style="color:#475569">${score ?? "--"}</b>
                <span style="color:#9ca3af"> · MONITORED</span>
              </div>`;
          }
          popup.setHTML(html);
        }
        popup.setLngLat(e.lngLat).addTo(map);
      });

      map.on("mouseleave", "country-fill", () => {
        map.getCanvas().style.cursor = "";
        lastCode = null;
        popup.remove();
      });

      // ── Click handlers ────────────────────────────────────────────
      let layerClicked = false;

      map.on("click", "country-fill", (e: any) => {
        layerClicked = true;
        const iso = e.features?.[0]?.properties?._iso as string;
        if (iso) onCountrySelectRef.current(iso);
      });

      // Click on ocean/non-fill → deselect
      map.on("click", () => {
        if (!layerClicked) onCountrySelectRef.current("");
        layerClicked = false;
      });
    };

    const fetchGeo = (url: string): Promise<GeoJSON.FeatureCollection> =>
      fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error("not ok"))));

    fetchGeo(GEOJSON_PRIMARY)
      .then(processGeo)
      .catch(() => fetchGeo(GEOJSON_FALLBACK).then(processGeo).catch(console.error));
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || token === "your_mapbox_token_here") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-400 mb-1">Mapbox token required</div>
          <div className="text-xs text-gray-300">Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local</div>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className="absolute inset-0 w-full h-full" />;
}

export default GlobeMap;
export { GlobeMap };
