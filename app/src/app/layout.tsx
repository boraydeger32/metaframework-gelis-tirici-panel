import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DynamicIsland } from "@/components/layout/dynamic-island";
import { ContextualDock } from "@/components/layout/contextual-dock";
import { AmbientBackground } from "@/components/layout/ambient-background";
import { FloatingOrb } from "@/components/ai/floating-orb";
import { AISuggestions } from "@/components/ai/ai-suggestions";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";
import { ToastContainer } from "@/components/ui/toast";
import { StatusBar } from "@/components/layout/status-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MetaPanel - AI-First Developer Panel",
  description: "AI-native developer panel for building custom applications",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    viewportFit: "cover",          // iOS safe area
  },
  themeColor: "#050510",           // Android status bar / Safari tab bar
  appleWebApp: {
    capable: true,
    title: "MetaPanel",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,               // prevent auto-linking numbers on iOS
  },
  other: {
    "mobile-web-app-capable": "yes",           // Android PWA
    "msapplication-TileColor": "#050510",       // Windows tiles
    "msapplication-navbutton-color": "#050510", // Windows Phone
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#050510] text-white/90">
        <AmbientBackground />
        <DynamicIsland />
        <AISuggestions />
        <KeyboardShortcuts />
        <main className="relative z-10 mx-auto max-w-6xl px-4 pt-18 pb-32 sm:px-8 sm:pt-22 sm:pb-28">{children}</main>
        <ContextualDock />
        <StatusBar />
        <FloatingOrb />
        <ToastContainer />
      </body>
    </html>
  );
}
