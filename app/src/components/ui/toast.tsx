"use client";

import { useToastStore } from "@/stores/toast-store";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "from-emerald-400/15 to-emerald-500/5 border-emerald-300/20 text-emerald-200",
  error: "from-red-400/15 to-red-500/5 border-red-300/20 text-red-200",
  warning: "from-amber-400/15 to-amber-500/5 border-amber-300/20 text-amber-200",
  info: "from-indigo-400/15 to-indigo-500/5 border-indigo-300/20 text-indigo-200",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3 bg-gradient-to-b backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.3)] animate-glass-in pointer-events-auto",
              styles[toast.type]
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-lg p-0.5 hover:bg-white/10 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
