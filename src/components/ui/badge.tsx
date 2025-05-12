import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-zinc-900 text-zinc-50 border-zinc-800",
        secondary: "bg-zinc-100 text-zinc-900 border-zinc-200",
        outline: "text-zinc-900 border-2 border-zinc-200 bg-transparent",
        success: "bg-emerald-100 text-emerald-800 border-emerald-200",
        warning: "bg-amber-100 text-amber-800 border-amber-200",
        error: "bg-red-100 text-red-800 border-red-200",
        table: "px-2.5 py-1 rounded-full w-fit border border-zinc-300 bg-zinc-100 text-zinc-800 inline-flex items-center gap-1 text-xs font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
