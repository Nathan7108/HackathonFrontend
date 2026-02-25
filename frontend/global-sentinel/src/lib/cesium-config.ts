/**
 * Cesium initialization helpers.
 * Used for shared config (e.g. Ion token) if needed across components.
 */

export const CESIUM_ION_TOKEN =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN ?? ""
    : "";

export const GOOGLE_MAPS_API_KEY =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""
    : "";
