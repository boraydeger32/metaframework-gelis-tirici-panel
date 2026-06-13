import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-xl border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-3.5 py-1 text-sm text-white/90 font-light shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-white/20 focus-visible:outline-none focus-visible:border-indigo-400/30 focus-visible:from-white/[0.08] focus-visible:to-white/[0.04] focus-visible:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_3px_rgba(99,102,241,0.15),0_0_20px_rgba(99,102,241,0.08)] disabled:cursor-not-allowed disabled:opacity-35",
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
