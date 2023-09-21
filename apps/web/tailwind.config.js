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
          primary: "#f2cf1f",

          secondary: "#62e3ef",

          accent: "#fb923c",

          neutral: "#1b191f",

          "base-100": "#000000",

          info: "#5985de",

          success: "#81e4af",

          warning: "#b5960d",

          error: "#f05161",
        },
      },
    ],
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
}
