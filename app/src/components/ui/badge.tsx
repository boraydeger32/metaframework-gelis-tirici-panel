import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium transition-colors backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-indigo-400/20 bg-indigo-500/15 text-indigo-300",
        secondary: "border-white/8 bg-white/[0.05] text-white/60",
        success: "border-emerald-400/20 bg-emerald-500/15 text-emerald-300",
        destructive: "border-red-400/20 bg-red-500/15 text-red-300",
        outline: "border-white/10 bg-transparent text-white/50",
        warning: "border-amber-400/20 bg-amber-500/15 text-amber-300",
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
