/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"], // remplace la font par défaut
      },
      colors: {
        primary: "#4ca260",
        secondary: "#3B5BAB",
      },
      keyframes: {
        slowPulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'pulse-slow': 'slowPulse 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};


