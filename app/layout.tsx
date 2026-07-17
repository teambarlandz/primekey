import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// ──────────────────────────────────────────────────────────────
// FONT CONFIGURATION
// Maps Google Fonts to the CSS variables defined in globals.css
// ──────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// ──────────────────────────────────────────────────────────────
// ROOT METADATA (SEO)
// ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Primekey Homes and Properties Ltd. | Premium Real Estate in Nigeria",
  description: 
    "Your trusted partner in Nigerian real estate. Buy, rent, or list verified properties with zero brokerage, end-to-end legal support, and a dedicated relationship manager.",
  keywords: [
    "Real Estate Nigeria", 
    "Lagos Properties", 
    "Abuja Real Estate", 
    "Zero Brokerage Nigeria", 
    "Primekey Homes",
    "Property Management Lagos"
  ],
  authors: [{ name: "Primekey Homes and Properties Ltd." }],
};

// ──────────────────────────────────────────────────────────────
// ROOT LAYOUT COMPONENT
// ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
    >
      {/* 
        We apply inter.className to the body so Inter is the default fallback, 
        while the CSS variables remain globally accessible via the html class.
      */}
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}