import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rausch: "#ff385c",
        "rausch-deep": "#e00b41",
        "canvas-white": "#ffffff",
        "soft-cloud": "#f7f7f7",
        "ink-black": "#222222",
        charcoal: "#3f3f3f",
        "ash-gray": "#6a6a6a",
        "mute-gray": "#929292",
        "stone-gray": "#c1c1c1",
        "hairline-gray": "#dddddd",
        "error-red": "#c13515",
        "info-blue": "#428bff",
      },
      fontFamily: {
        sans: [
          "'Noto Sans TC'",
          "-apple-system",
          "system-ui",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "sans-serif",
        ],
      },
      borderRadius: {
        airbnb: "8px",
        card: "14px",
        pill: "20px",
        search: "32px",
        circle: "50%",
      },
      boxShadow: {
        elevated:
          "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px 0, rgba(0, 0, 0, 0.1) 0 4px 8px 0",
        "btn-active": "rgba(0, 0, 0, 0.08) 0 4px 12px",
        input: "rgba(0, 0, 0, 0.04) 0 2px 6px 0",
      },
    },
  },
  plugins: [],
};
export default config;
