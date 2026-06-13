"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 backdrop-blur-sm shadow-lg shadow-indigo-500/10 hover:bg-indigo-500/30 hover:border-indigo-400/30 hover:shadow-indigo-500/20",
        destructive:
          "bg-red-500/15 text-red-300 border border-red-400/20 backdrop-blur-sm hover:bg-red-500/25 hover:border-red-400/30",
        outline:
          "bg-white/[0.03] text-white/70 border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/15 hover:text-white/90",
        secondary:
          "bg-white/[0.05] text-white/70 border border-white/8 backdrop-blur-sm hover:bg-white/[0.08] hover:text-white/90",
        ghost:
          "text-white/50 hover:bg-white/[0.05] hover:text-white/80",
        link:
          "text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6",
        icon: "h-9 w-9 rounded-lg",
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
