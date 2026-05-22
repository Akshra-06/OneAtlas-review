import "./globals.css";
import type { ReactNode } from "react";
import Providers from "@/components/providers";
import ErrorBoundary from "@/components/safe/error-boundary";
import SafeModeBanner from "@/components/safe-mode-banner";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ErrorBoundary>
            <SafeModeBanner />
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
