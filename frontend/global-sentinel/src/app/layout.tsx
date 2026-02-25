import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sentinel AI — Global Threat Intelligence",
  description: "Real-time geopolitical crisis prediction platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-gray-200 antialiased">{children}</body>
    </html>
  );
}
