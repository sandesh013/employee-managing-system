/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class", // enables dark mode via a 'dark' class on <html>
  theme: {
    extend: {
      colors: {
        // Core Blue + White theme used across the HRMS dashboard
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#0b1b45",
        },
        // Signature deep-navy anchor used for the sidebar gradient — keeps
        // the "Blue + White" brief but gives the nav rail its own identity.
        navy: {
          800: "#111c3d",
          900: "#0b1330",
          950: "#060a1c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
