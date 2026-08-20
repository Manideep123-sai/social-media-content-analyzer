/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matte: {
          950: '#08080a',
          900: '#111215',
          850: '#16171b',
          800: '#1c1d22',
          750: '#23252b',
          700: '#2b2d35',
        },
        warm: {
          50: '#faf9f6',
          100: '#f5f4f0',
          200: '#e8e6e1',
          300: '#d9d6ce',
          800: '#292524',
          900: '#1c1917',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        }
      }
    },
  },
  plugins: [],
}
