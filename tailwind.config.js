/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#fa803d',
        secondary: '#5d534e',
        background: '#f4f2ec',
        accent: '#bfbbb9',
      }
    },
  },
  plugins: [],
};