import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-[#2D4A3E] text-white hover:bg-[#4A7C6F]",
          variant === "outline" && "border border-[#E5E5E5] bg-white text-[#1A1A1A] hover:bg-gray-50",
          variant === "ghost" && "text-[#6B6B6B] hover:bg-gray-100",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
