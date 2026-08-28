import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "inverse";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-colors duration-200 focus-ring disabled:opacity-50 disabled:pointer-events-none";

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3 text-sm",
};

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-container shadow-sm",
  secondary:
    "bg-surface-container-lowest text-primary border-2 border-primary hover:bg-surface-container",
  ghost: "text-primary hover:text-secondary hover:bg-surface-container-low",
  danger: "bg-error text-on-error hover:opacity-90",
  inverse:
    "border-2 border-surface-container-lowest text-surface-container-lowest hover:bg-surface-container-lowest hover:text-primary",
};

export function buttonVariants(variant: Variant = "primary", size: Size = "md"): string {
  return `${base} ${sizes[size]} ${variants[variant]}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return <button className={`${buttonVariants(variant, size)} ${className}`} {...props} />;
}
