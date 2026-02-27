import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/shell/Sidebar";
import { Header } from "@/components/shell/Header";
import { SigactTicker } from "@/components/dashboard/SigactTicker";
import { ScenarioProvider } from "@/lib/scenario-context";
import { SidebarProvider } from "@/components/shell/SidebarContext";

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
    <html lang="en" className="light">
      <body suppressHydrationWarning>
        <ScenarioProvider>
          <SidebarProvider>
            <div className="h-screen w-screen flex overflow-hidden" style={{ background: "var(--shell-bg)" }}>
              {/* Sidebar */}
              <Sidebar />

              {/* Right side — shell: header + white content shell */}
              <div className="flex-1 flex flex-col min-w-0 min-h-0" style={{ background: "var(--shell-bg)" }}>
                <Header />

                {/* Content area — grey gap around white shell */}
                <main className="flex-1 min-h-0 overflow-hidden" style={{ padding: "16px 0 16px 16px" }}>
                  <div
                    className="h-full rounded-l-xl overflow-hidden shadow-sm flex flex-col"
                    style={{ background: "var(--content-bg)" }}
                  >
                    <div className="flex-1 min-h-0 overflow-y-auto content-scroll">
                      {children}
                    </div>
                    {/* Ticker — attached to white shell bottom, never over grey gutter */}
                    <SigactTicker />
                  </div>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </ScenarioProvider>
      </body>
    </html>
  );
}
