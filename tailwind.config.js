/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#10B981', // Emerald 500
        secondary: '#F43F5E', // Rose 500
        background: '#F9FAFB', // Gray 50
        card: '#FFFFFF',
        text: '#1F2937', // Gray 800
      }
    },
  },
  plugins: [],
}
