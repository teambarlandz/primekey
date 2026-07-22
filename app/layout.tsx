import type { Metadata } from "next";
import { Poppins, Lora } from "next/font/google";
import "./globals.css";

// ──────────────────────────────────────────────────────────────
// FONT CONFIGURATION
// Maps Poppins and Lora to CSS variables defined in globals.css
// ──────────────────────────────────────────────────────────────

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
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
      className={`${poppins.variable} ${lora.variable}`}
    >
      <body className={`${lora.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
