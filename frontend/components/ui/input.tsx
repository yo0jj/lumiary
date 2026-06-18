import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full border border-[#E5E5E5] bg-white px-4 py-3 text-[#1A1A1A] placeholder:text-[#ABABAB] focus:border-[#2D4A3E] focus:outline-none transition-colors",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
