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
          // USIU-Africa brand: Primary Blue RGB(43, 57, 144)
          blue: "#2B3990",
          // Primary Yellow/Gold RGB(205, 203, 5)
          gold: "#CDCB05",
          // `navy` kept as token name used across components — maps to brand blue
          navy: "#2B3990",
          // Light surfaces derived from primary (neutrals stay Tailwind slate/white/black)
          muted: "#EEF0F9",
        },
      },
    },
  },
  plugins: [],
}
