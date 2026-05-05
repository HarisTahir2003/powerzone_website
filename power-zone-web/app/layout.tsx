import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";

// Title face — Bricolage Grotesque. Geometric sans with personality;
// reads as architectural at display sizes without feeling generic the
// way Inter / Geist do.
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Body face — Manrope. Humanist sans, premium feel, pairs cleanly with
// Bricolage. Generous range of weights for spec copy and lists.
const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Power Zone — Generators & Energy Storage",
  description:
    "Power Zone Pakistan — diesel generators and battery energy storage solutions for industrial, commercial, and residential power.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // Suppresses the React hydration warning when browser extensions
      // (Grammarly, Qbasis, password managers, etc.) inject attributes
      // onto the <html>/<body> before hydration. The mismatch is in
      // those extension-added attributes, not in our markup.
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-body"
      >
        {children}
      </body>
    </html>
  );
}
