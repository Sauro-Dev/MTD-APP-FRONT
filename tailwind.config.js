/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ED117F',
        secondary: '#F4C22E',
        accent: '#F1C135',
        dark: '#000000',
        light: '#FFFFFF',
      },
      container: {
        center: true,
        padding: '1rem',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      animation: {
        'infinite-scroll-half': 'infinite-scroll-half 15s linear infinite',
        'infinite-scroll-half-mobile': 'infinite-scroll-half-mobile 20s linear infinite',
        'infinite-scroll-highres': 'infinite-scroll-highres 10s linear infinite',
      },
      keyframes: {
        'infinite-scroll-half': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'infinite-scroll-half-mobile': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'infinite-scroll-highres': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
