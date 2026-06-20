"use client";

import { cn } from "@/lib/cn";
import { forwardRef, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size" | "children"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: ReactNode;
}

const wrapperVariantClasses: Record<Variant, string> = {
  primary: "bg-line-strong hover:bg-brand",
  secondary: "bg-line-medium hover:bg-line-strong",
  ghost: "bg-transparent shadow-none",
  danger: "bg-danger hover:bg-danger",
};

const buttonVariantClasses: Record<Variant, string> = {
  primary: "bg-brand-soft text-text hover:bg-bg-soft",
  secondary: "bg-bg-soft text-text-dim hover:bg-bg-card hover:text-text",
  ghost: "bg-transparent text-text-dim hover:bg-bg-soft hover:text-text",
  danger: "bg-danger-soft text-danger hover:bg-danger-soft",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

const clipPath =
  "polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "secondary", size = "md", loading, disabled, children, whileTap, whileHover, ...props },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <span
        className={cn(
          "inline-flex p-px transition duration-300",
          variant !== "ghost" &&
            "shadow-[var(--glow-card),inset_var(--color-1-400)_0_6px_0_-5px,var(--color-1-700)_0_4px_10px_-5px] hover:-translate-y-px hover:shadow-[var(--glow-card-hover)]",
          isDisabled && "cursor-not-allowed bg-bg-soft opacity-60 shadow-none hover:translate-y-0",
          "typeui-button-shell",
          `typeui-button-${variant}`,
          wrapperVariantClasses[variant],
          className
        )}
        style={{ clipPath }}
      >
        <motion.button
          ref={ref}
          disabled={isDisabled}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 font-medium uppercase tracking-[0.08em] transition duration-300 disabled:cursor-not-allowed",
            "typeui-button-control",
            buttonVariantClasses[variant],
            sizeClasses[size]
          )}
          style={{ clipPath }}
          whileTap={!isDisabled ? (whileTap ?? { scale: 0.96 }) : undefined}
          whileHover={!isDisabled ? (whileHover ?? { scale: 1.01 }) : undefined}
          {...props}
        >
          {loading && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {children}
        </motion.button>
      </span>
    );
  }
);

Button.displayName = "Button";
