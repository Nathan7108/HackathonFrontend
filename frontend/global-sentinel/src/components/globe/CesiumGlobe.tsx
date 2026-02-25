"use client";

import { useEffect, useRef } from "react";
import {
  Viewer,
  Cesium3DTileset,
  Ion,
  SkyAtmosphere,
  Color,
  Cartesian3,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from "cesium";

export default function CesiumGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    Ion.defaultAccessToken =
      process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || "";

    const viewer = new Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      projectionPicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      vrButton: false,
      selectionIndicator: false,
      infoBox: false,
      creditContainer: document.createElement("div"),

      skyBox: false,
      skyAtmosphere: new SkyAtmosphere(),
      requestRenderMode: false,
      maximumRenderTimeChange: Infinity,
    });

    viewerRef.current = viewer;

    viewer.scene.backgroundColor = Color.BLACK;

    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.atmosphereLightIntensity = 20.0;

    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.brightnessShift = 0.0;
      viewer.scene.skyAtmosphere.hueShift = 0.0;
      viewer.scene.skyAtmosphere.saturationShift = 0.0;
    }

    viewer.scene.sun && (viewer.scene.sun.show = true);
    viewer.scene.moon && (viewer.scene.moon.show = true);

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(30, 20, 20_000_000),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-75),
        roll: 0,
      },
    });

    const loadGoogleTiles = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === "your_key_here") {
        return;
      }
      try {
        const tileset = await Cesium3DTileset.fromUrl(
          `https://tile.googleapis.com/v1/3dtiles/root.json?key=${apiKey}`
        );
        viewer.scene.primitives.add(tileset);
      } catch (error) {
        console.warn("Google 3D Tiles not loaded; using default globe.", error);
      }
    };
    loadGoogleTiles();

    let lastInteractionTime = Date.now();
    const IDLE_THRESHOLD = 5000;

    const rotateGlobe = () => {
      if (Date.now() - lastInteractionTime > IDLE_THRESHOLD) {
        viewer.camera.rotate(
          Cartesian3.UNIT_Z,
          CesiumMath.toRadians(0.03)
        );
      }
    };

    viewer.clock.onTick.addEventListener(rotateGlobe);

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    const resetIdle = () => {
      lastInteractionTime = Date.now();
    };
    handler.setInputAction(resetIdle, ScreenSpaceEventType.LEFT_DOWN);
    handler.setInputAction(resetIdle, ScreenSpaceEventType.WHEEL);
    handler.setInputAction(resetIdle, ScreenSpaceEventType.MIDDLE_DOWN);
    handler.setInputAction(resetIdle, ScreenSpaceEventType.RIGHT_DOWN);
    handler.setInputAction(resetIdle, ScreenSpaceEventType.PINCH_START);

    return () => {
      handler.destroy();
      viewer.clock.onTick.removeEventListener(rotateGlobe);
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewerRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ position: "absolute", inset: 0 }}
    />
  );
}
