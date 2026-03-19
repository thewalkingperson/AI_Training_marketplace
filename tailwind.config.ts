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
        canvas: "#f7f3ea",
        ink: "#11120f",
        ember: "#d95f2b",
        moss: "#496c4f",
        sea: "#175b78",
        sand: "#e2c88b"
      },
      boxShadow: {
        card: "0 22px 60px rgba(17, 18, 15, 0.08)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backgroundImage: {
        "grid-fade": "radial-gradient(circle at top, rgba(23, 91, 120, 0.14), transparent 55%), linear-gradient(135deg, rgba(217, 95, 43, 0.14), transparent 40%)"
      }
    }
  },
  plugins: []
};

export default config;
