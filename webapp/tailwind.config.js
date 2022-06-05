module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deticket-blue': '#192A56',
        'deticket-blue-dark': '#081B4E',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
