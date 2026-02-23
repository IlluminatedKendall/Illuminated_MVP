import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        neonPurple: "#7C3AED",
        softGray: "#F6F6FA"
      },
      boxShadow: {
        glow: "0 14px 36px -18px rgba(124, 58, 237, 0.55)"
      }
    }
  },
  plugins: []
};

export default config;
