
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CA260',
        secondary: '#3B5BAB',
        black: '#000000',
      },
      animation: {
        slowPulse: 'slowPulse 6s ease-in-out infinite',
      },
      keyframes: {
        slowPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
