// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base:       '#0F0B21',
        surface:    '#1A1535',
        elevated:   '#231E42',
        nested:     '#2D2653',
        hovbg:      '#362F5E',
        border:     '#2D2653',
        borderhov:  '#433B72',
        txt:        '#F1F0F7',
        txtsec:     '#A8A3C7',
        txtmuted:   '#6E6893',
        txtdis:     '#4A4570',
        primary:    '#7C3AED',
        primarydk:  '#6D28D9',
        teal:       '#2DD4BF',
        rose:       '#F43F5E',
        amber:      '#FB923C',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
