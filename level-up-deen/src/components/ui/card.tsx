"use client";

import { cn } from "@/lib/cn";
import { forwardRef, HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("surface-card transition-transform duration-200 hover:-translate-y-0.5", className)}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
