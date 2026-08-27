import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dulce: {
          orange: "#f5871f",
          "orange-dark": "#d96f0c",
          "orange-light": "#fff4e6",
          ink: "#2b2119",
          cream: "#fdf8f2",
          surface: "#f5f6f8",
          border: "#e6e5e2",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px -2px rgb(43 33 25 / 0.06)",
        card: "0 8px 30px -12px rgb(43 33 25 / 0.18)",
        glow: "0 12px 30px -10px rgb(245 135 31 / 0.45)",
      },
      backgroundImage: {
        "dulce-radial": "radial-gradient(circle at 30% 20%, #fff4e6 0%, #fdf8f2 55%, #fdf8f2 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
