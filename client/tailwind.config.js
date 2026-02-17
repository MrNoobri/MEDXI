import tokens from "./src/theme/tokens.json";
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        ...tokens.colors,
        primary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        gray: {
          ...tokens.colors.gray,
          // We can override specific grays if needed, or just use Slate via class names if we prefer
          // For now, let's keep the token grays but maybe shift them slightly if they are too cool/warm
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
