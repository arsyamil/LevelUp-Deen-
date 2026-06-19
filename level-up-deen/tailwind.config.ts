import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        bg: "var(--bg)",
        "bg-soft": "var(--bg-soft)",
        "bg-card": "var(--bg-card)",
        text: "var(--text)",
        "text-dim": "var(--text-dim)",
        line: "var(--line)",
        "line-medium": "var(--line-medium)",
        "line-strong": "var(--line-strong)",
        brand: "var(--brand)",
        "brand-soft": "var(--brand-soft)",
        "brand-strong": "var(--brand-strong)",
        danger: "var(--danger)",
        success: "var(--success)",
        warning: "var(--warning)",
      },
    },
  },
  plugins: [],
};
export default config;
