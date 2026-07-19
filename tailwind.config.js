/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1d1d1f",
        accent: "#0071e3",
      },
      fontFamily: {
        roboto: ['"Roboto"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
