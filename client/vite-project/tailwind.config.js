export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Poppins", "Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        nep: {
          50: "#F5F9FF",
          100: "#E6F0FF",
          200: "#BFDBFF",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
        },
        accent: {
          400: "#7C3AED",
          500: "#6D28D9",
        },
        warm: {
          400: "#F59E0B",
          500: "#D97706",
        },
        neutral: {
          400: "#94A3B8",
          500: "#64748B",
        },
      },
      screens: {
        "3xl": "1920px",
      },
    },
  },
  plugins: [],
};
