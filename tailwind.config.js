/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black:   '#000000',
        card:    '#0e0e1c',
        card2:   '#13132a',
        teal:    '#10b981',
        teal2:   '#34d399',
        emerald: '#10b981',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter:   ['Inter', 'sans-serif'],
      },
      animation: {
        'float':     'float 5s ease-in-out infinite',
        'spin-slow': 'spinSlow 9s linear infinite',
        'blink':     'blink 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
