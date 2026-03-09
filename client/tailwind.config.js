/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        usiu: {
          navy: "#0B1F3A",
          red: "#C1121F",
          slate: "#0F172A",
        },
      },
    },
  },
  plugins: [],
}