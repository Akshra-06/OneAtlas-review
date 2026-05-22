import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  weight: ["400","500","600","700","800"], 
  variable: "--font-inter", 
  display: "swap" 
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  weight: ["400","500"], 
  variable: "--font-jetbrains-mono", 
  display: "swap" 
});

const instrumentSerif = Instrument_Serif({ 
  subsets: ["latin"], 
  weight: ["400"], 
  style: ["normal","italic"], 
  variable: "--font-instrument-serif", 
  display: "swap" 
});

export const metadata: Metadata = { 
  title: "OneAtlas.dev — Where ideas become tools", 
  description: "Describe what your team needs. OneAtlas generates a production-ready internal tool and deploys it instantly." 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}>
        <body>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}