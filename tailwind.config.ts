import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#10b565",
          50: "#f0fdf7",
          100: "#dcfcea",
          200: "#bbf7d4",
          300: "#86efb4",
          400: "#4ade8a",
          500: "#10b565",
          600: "#0d9955",
          700: "#0a7d45",
          800: "#096438",
          900: "#07502e",
          950: "#03291a",
        },
        cream: {
          50: "#fdfcf9",
          100: "#faf7f0",
          200: "#f5ede0",
          300: "#ede0cb",
          400: "#e0cdb2",
        },
        charcoal: {
          800: "#1a1a2e",
          900: "#0f0f1a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
        "cart-pulse": "cartPulse 0.3s ease-in-out",
        "shimmer": "shimmer 1.5s infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        cartPulse: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        "card": "0 2px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 32px rgba(16,181,101,0.15)",
        "btn": "0 4px 14px rgba(16,181,101,0.35)",
        "glass": "0 8px 32px rgba(0,0,0,0.1)",
      },
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(135deg, #0f0f1a 0%, #1a2e1e 50%, #0f0f1a 100%)",
        "gradient-card":
          "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.5) 100%)",
        "shimmer-gradient":
          "linear-gradient(90deg, #f0fdf7 25%, #dcfcea 50%, #f0fdf7 75%)",
      },
    },
  },
  plugins: [],
};

export default config;
