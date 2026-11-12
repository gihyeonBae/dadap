/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'accent-neon': 'var(--color-accent-neon)',
        'soft-blue': '#A7C7E7',
        'candy-pink': '#FFC0CB',
        'mint-green': '#98FF98',
        'peach-orange': '#FFDAB9',
      },
      boxShadow: {
        'inner-clay': 'inset 5px 5px 10px #b0b0b0, inset -5px -5px 10px #ffffff',
        'inner-clay-dark': 'inset 5px 5px 10px #1a1a1a, inset -5px -5px 10px #333333',
      },
    },
  },
  plugins: [require('tailwindcss-textshadow')],
}
