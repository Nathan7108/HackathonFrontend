"use client";

import dynamic from "next/dynamic";

// CesiumJS uses browser APIs (WebGL, Workers) — must be client-only
const CesiumGlobe = dynamic(
  () => import("@/components/globe/CesiumGlobe"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-black">
      <CesiumGlobe />
    </main>
  );
}
