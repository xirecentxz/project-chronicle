/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        board: '#2d5016',
        'board-dark': '#1a3009',
        hole: '#8B6914',
        'hole-dark': '#5c4409',
        store: '#FFD700',
        'store-dark': '#b89600',
      },
      fontFamily: {
        decorative: ['"Luckiest Guy"', '"Baloo 2"', 'cursive'],
        body: ['"Baloo 2"', 'sans-serif'],
      },
      keyframes: {
        pulseBorder: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(74, 222, 128, 0.7)' },
          '50%': { boxShadow: '0 0 0 8px rgba(74, 222, 128, 0)' },
        },
        flash: {
          '0%, 100%': { backgroundColor: 'rgba(255, 215, 0, 0)' },
          '50%': { backgroundColor: 'rgba(255, 215, 0, 0.85)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        toastIn: {
          '0%': { transform: 'translateX(120%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        pulseBorder: 'pulseBorder 1.4s ease-in-out infinite',
        flash: 'flash 0.5s ease-in-out 2',
        spinSlow: 'spin 1.6s linear infinite',
        toastIn: 'toastIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
