/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f7f7",
          100: "#b3e6e6",
          200: "#80d5d5",
          300: "#4dc4c4",
          400: "#1ab3b3",
          500: "#00a2a2",
          600: "#008282",
          700: "#006161",
          800: "#004141",
          900: "#002020",
        },
        success: {
          light: "#86efac",
          DEFAULT: "#22c55e",
          dark: "#16a34a",
        },
        warning: {
          light: "#fde047",
          DEFAULT: "#eab308",
          dark: "#ca8a04",
        },
        danger: {
          light: "#fca5a5",
          DEFAULT: "#ef4444",
          dark: "#dc2626",
        },
      },
    },
  },
  plugins: [],
};
