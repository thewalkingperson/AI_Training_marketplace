import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#fcf9f1",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f4eb",
        "surface-container": "#f0eee6",
        "surface-container-high": "#eae8e0",
        "surface-container-highest": "#e4e2da",
        "surface-dim": "#dcdad2",
        "surface-variant": "#e4e2da",
        "on-surface": "#1b1c17",
        "on-surface-variant": "#58423b",
        primary: "#a3380f",
        "primary-container": "#c45026",
        "primary-fixed": "#ffdbd0",
        secondary: "#426087",
        tertiary: "#48624b",
        "tertiary-fixed": "#cceacc",
        outline: "#8b7169",
        "outline-variant": "#dfc0b7",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        canvas: "#fcf9f1",
        ink: "#1b1c17",
        ember: "#a3380f",
        moss: "#48624b",
        sea: "#426087",
        sand: "#ffdbd0"
      },
      fontFamily: {
        headline: ["var(--font-headline)"],
        body: ["var(--font-body)"],
        label: ["var(--font-label)"],
        mono: ["var(--font-mono)"]
      },
      boxShadow: {
        card: "0 28px 72px rgba(27, 28, 23, 0.06)",
        float: "0 40px 64px rgba(27, 28, 23, 0.05)"
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem"
      },
      backgroundImage: {
        "audit-grid": "linear-gradient(to right, rgba(139, 113, 105, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 113, 105, 0.08) 1px, transparent 1px)",
        "ember-radial": "radial-gradient(circle at 45% 45%, #c45026 0%, #a3380f 100%)",
        "technical-grid": "radial-gradient(rgba(27, 28, 23, 0.13) 0.5px, transparent 0.5px)"
      }
    }
  },
  plugins: []
};

export default config;
