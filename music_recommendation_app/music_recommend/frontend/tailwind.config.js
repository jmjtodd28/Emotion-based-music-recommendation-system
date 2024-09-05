/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.js"],
  theme: {
    extend: {
      backgroundColor: {
        // main: "#12132E",
        main: "#FFFFFF",
        // second: "#151638",
        second: "F5F5F5",
        third: "#ED3676",
        fourth: "rgb(74,79,234)",
      },
      colors: {
        third: "#ED3676",
        fourth: "rgb(74,79,234)",
      },
    },
  },
  plugins: [],
};
