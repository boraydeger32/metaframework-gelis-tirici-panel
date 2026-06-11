"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Puzzle,
  Palette,
  Terminal,
  FileCode,
  Webhook,
  Settings,
  Layers,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Schema Builder", href: "/schema", icon: Database },
  { label: "Modules", href: "/modules", icon: Puzzle },
  { label: "Forms", href: "/forms", icon: Layers },
  { label: "Theme Engine", href: "/theme", icon: Palette },
  { label: "API Explorer", href: "/api-explorer", icon: FileCode },
  { label: "AI Copilot", href: "/ai-copilot", icon: Terminal },
  { label: "Webhooks", href: "/webhooks", icon: Webhook },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-neutral-800 bg-neutral-950">
      <div className="flex h-14 items-center gap-2 border-b border-neutral-800 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
          M
        </div>
        <span className="text-lg font-semibold text-neutral-100">MetaPanel</span>
        <span className="ml-auto rounded-md bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-400">
          dev
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600/10 text-indigo-400"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-800 p-4">
        <div className="rounded-lg bg-neutral-900 p-3">
          <p className="text-xs text-neutral-500">AI Copilot</p>
          <p className="mt-1 text-xs text-neutral-300">
            <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px]">⌘K</kbd> ile hızlı komut
          </p>
        </div>
      </div>
    </aside>
  );
}
