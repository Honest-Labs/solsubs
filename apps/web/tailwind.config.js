/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#9bff9b",

          secondary: "#db6013",

          accent: "#f8ccff",

          neutral: "#2b2438",

          "base-100": "#313235",

          info: "#43a6df",

          success: "#79e2d9",

          warning: "#f49910",

          error: "#f0282c",
        },
      },
    ],
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
};
