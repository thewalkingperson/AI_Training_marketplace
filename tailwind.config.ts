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
        surface: "#f8f0e6",
        "surface-container-lowest": "#fffaf4",
        "surface-container-low": "#f7ede1",
        "surface-container": "#f2e6d8",
        "surface-container-high": "#ecdfd1",
        "surface-container-highest": "#e6d8ca",
        "surface-dim": "#d9cabc",
        "surface-variant": "#e8dbcf",
        "on-surface": "#211c17",
        "on-surface-variant": "#564a40",
        primary: "#af4d1f",
        "primary-container": "#f2c7ae",
        "primary-fixed": "#ffd9c5",
        "primary-fixed-dim": "#f1b796",
        secondary: "#1f6076",
        "secondary-fixed": "#c8e7f2",
        "secondary-container": "#a7d4e5",
        "on-secondary-container": "#123d4a",
        tertiary: "#576f43",
        "tertiary-fixed": "#d8e6c6",
        outline: "#8c7b6c",
        "outline-variant": "#d4c2b3",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        canvas: "#f8f0e6",
        ink: "#211c17",
        ember: "#af4d1f",
        moss: "#576f43",
        sea: "#1f6076",
        sand: "#f6d49c"
      },
      fontFamily: {
        headline: ["var(--font-headline)"],
        body: ["var(--font-body)"],
        label: ["var(--font-label)"],
        mono: ["var(--font-mono)"]
      },
      boxShadow: {
        card: "0 28px 72px rgba(27, 28, 25, 0.04)",
        float: "0 40px 64px rgba(27, 28, 25, 0.05)"
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem"
      },
      backgroundImage: {
        "audit-grid": "linear-gradient(to right, rgba(191, 201, 196, 0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(191, 201, 196, 0.18) 1px, transparent 1px)",
        "ember-radial": "radial-gradient(circle at 45% 45%, #004d40 0%, #00342b 100%)",
        "technical-grid": "radial-gradient(rgba(27, 28, 25, 0.1) 0.5px, transparent 0.5px)"
      }
    }
  },
  plugins: []
};

export default config;
