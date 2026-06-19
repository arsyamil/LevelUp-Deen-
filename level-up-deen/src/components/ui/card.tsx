"use client";

import { cn } from "@/lib/cn";
import { HTMLMotionProps, motion } from "framer-motion";
import { forwardRef } from "react";

type CardProps = HTMLMotionProps<"div">;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, whileHover, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn("surface-card", className)}
        whileHover={whileHover ?? { y: -2 }}
        transition={{ duration: 0.2 }}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
