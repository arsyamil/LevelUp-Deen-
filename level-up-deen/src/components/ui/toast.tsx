"use client";

import { useEffect, useState } from "react";

export function Toast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed right-4 top-4 z-50 transform-gpu">
      <div className="rounded-2xl border border-line bg-bg p-3 shadow-lg">
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
