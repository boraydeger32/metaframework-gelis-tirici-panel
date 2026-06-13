import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-white/90 shadow-sm backdrop-blur-sm transition-all placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/30 focus-visible:border-indigo-400/30 focus-visible:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40",
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
