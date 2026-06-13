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
  success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  error: "border-red-400/20 bg-red-500/10 text-red-300",
  warning: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  info: "border-indigo-400/20 bg-indigo-500/10 text-indigo-300",
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
              "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl animate-glass-in pointer-events-auto",
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
