import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

function Progress({ className, value = 0, ...props }: ProgressProps) {
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-full bg-[#E5E5E5]", className)}
      {...props}
    >
      <div
        className="h-full bg-[#2D4A3E] transition-all"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}

export { Progress }
