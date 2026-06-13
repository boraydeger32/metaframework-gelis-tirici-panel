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
        <main className="relative z-10 mx-auto max-w-7xl px-3 pt-16 pb-28 sm:px-6 sm:pt-20 sm:pb-24">{children}</main>
        <ContextualDock />
        <FloatingOrb />
        <ToastContainer />
      </body>
    </html>
  );
}
