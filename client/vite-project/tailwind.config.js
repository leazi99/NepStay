export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: '#00A7F3',
      },
      screens: {
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
};
