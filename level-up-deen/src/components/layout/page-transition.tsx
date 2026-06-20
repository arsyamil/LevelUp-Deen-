"use client";

import { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">{children}</div>;
}
