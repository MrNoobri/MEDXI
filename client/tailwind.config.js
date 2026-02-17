import tokens from "./src/theme/tokens.json";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ...tokens.colors,
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
