import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        paper: "#f7f8fb",
        brand: "#22c55e",
        lagoon: "#0891b2",
        signal: "#f59e0b",
        plum: "#7c3aed",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(8, 145, 178, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
