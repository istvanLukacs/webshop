/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#030213',
        destructive: '#D4183D',
        muted: {
          foreground: '#717182'
        },
        background: '#FFFFFF',
        card: '#FFFFFF',
        border: 'rgba(0, 0, 0, 0.1)',
        input: '#F3F3F5',
        placeholder: '#999999'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'modal': '0px 10px 15px 0px rgba(0, 0, 0, 0.1), 0px 4px 6px 0px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }
    },
  },
  plugins: [],
}
