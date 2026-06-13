import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-all duration-200 backdrop-blur-sm shadow-[inset_0_0.5px_0_rgba(255,255,255,0.1)]",
  {
    variants: {
      variant: {
        default: "border-indigo-300/20 bg-gradient-to-b from-indigo-400/20 to-indigo-500/8 text-indigo-200",
        secondary: "border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] text-white/55",
        success: "border-emerald-300/20 bg-gradient-to-b from-emerald-400/20 to-emerald-500/8 text-emerald-200",
        destructive: "border-red-300/20 bg-gradient-to-b from-red-400/18 to-red-500/8 text-red-200",
        outline: "border-white/12 bg-transparent text-white/50 shadow-none",
        warning: "border-amber-300/20 bg-gradient-to-b from-amber-400/20 to-amber-500/8 text-amber-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
