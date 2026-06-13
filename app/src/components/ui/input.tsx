import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-xl border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-3 py-1 text-sm text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm transition-all placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/30 focus-visible:border-indigo-400/25 focus-visible:from-white/[0.08] focus-visible:to-white/[0.03] disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
