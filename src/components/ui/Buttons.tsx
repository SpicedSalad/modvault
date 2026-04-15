import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-6 py-3 font-pixel border-pixel text-white uppercase tracking-wider text-sm btn-push transition-colors",
          {
            "bg-grass hover:bg-[#4d911a]": variant === "primary",
            "bg-deepslate hover:bg-[#3a3a3a]": variant === "secondary",
            "bg-red-600 hover:bg-red-500": variant === "danger",
            "bg-transparent border-none shadow-none hover:bg-white/10 btn-push-none": variant === "ghost",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
