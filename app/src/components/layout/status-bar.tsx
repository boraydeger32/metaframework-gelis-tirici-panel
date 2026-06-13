"use client";

import { useSchemaStore } from "@/stores/schema-store";
import { useModuleStore } from "@/stores/module-store";
import { useActivityStore } from "@/stores/activity-store";

export function StatusBar() {
  const modelCount = useSchemaStore((s) => s.models.length);
  const moduleCount = useModuleStore((s) => s.modules.filter((m) => m.enabled).length);
  const totalModules = useModuleStore((s) => s.modules.length);
  const activityCount = useActivityStore((s) => s.activities.length);

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-30 hidden sm:flex items-center gap-6 border-t border-white/[0.06] bg-gradient-to-r from-white/[0.02] via-white/[0.03] to-white/[0.02] backdrop-blur-xl px-4 py-1.5 text-[11px] font-light tracking-wide"
      style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
        <span className="text-white/35">system ok</span>
      </div>

      <span className="text-white/25">{modelCount} models</span>
      <span className="text-white/25">{moduleCount}/{totalModules} modules</span>
      <span className="hidden md:inline text-white/25">{activityCount} events</span>
      <span className="hidden md:inline text-white/25">API: {modelCount * 5} endpoints</span>

      <span className="ml-auto text-white/20 font-mono text-[10px]">
        env: dev · v0.1.0
      </span>
    </footer>
  );
}
