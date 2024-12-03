/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gold': {
          500: '#FFD700',
        },
        'silver': {
          500: '#C0C0C0',
        },
        'bronze': {
          500: '#CD7F32',
        },
      },
    },
  },
  plugins: [],
}
