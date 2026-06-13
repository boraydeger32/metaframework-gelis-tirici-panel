"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-35 cursor-pointer active:scale-[0.96] active:duration-100",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-indigo-400/25 to-indigo-600/15 text-indigo-200 border border-indigo-300/20 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.1),0_4px_20px_rgba(99,102,241,0.15),0_1px_3px_rgba(0,0,0,0.2)] hover:from-indigo-400/35 hover:to-indigo-600/20 hover:border-indigo-300/30 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.1),0_8px_30px_rgba(99,102,241,0.25),0_2px_6px_rgba(0,0,0,0.25)] hover:translate-y-[-0.5px]",
        destructive:
          "bg-gradient-to-b from-red-400/20 to-red-600/10 text-red-200 border border-red-300/20 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(239,68,68,0.1)] hover:from-red-400/28 hover:to-red-600/15 hover:border-red-300/25",
        outline:
          "bg-gradient-to-b from-white/[0.08] to-white/[0.03] text-white/75 border border-white/14 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-0.5px_0_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.12)] hover:from-white/[0.12] hover:to-white/[0.05] hover:border-white/20 hover:text-white/90 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_20px_rgba(0,0,0,0.18)] hover:translate-y-[-0.5px]",
        secondary:
          "bg-gradient-to-b from-white/[0.06] to-white/[0.02] text-white/65 border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:from-white/[0.10] hover:to-white/[0.04] hover:text-white/85 hover:border-white/14",
        ghost:
          "text-white/50 rounded-xl hover:bg-white/[0.06] hover:text-white/80 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        link:
          "text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 rounded-xl px-3.5 text-xs",
        lg: "h-11 rounded-2xl px-7 text-base",
        icon: "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
