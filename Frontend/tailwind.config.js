/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "node_modules/flowbite/**/*.js", // Include Flowbite content
  ],

  theme: {
    extend: {
      screens: {
        esmd: "300px",
        smd: "340px",
        lmd: "400px",
        elmd: "500px",
        lsm: "800px",
        emd: "900px",
        exmd: "1000px",
        elg: "1100px",
      },
    },
  },
  plugins: [
    require("daisyui"),
    require("flowbite/plugin"),
    require("tailwind-scrollbar-hide"),
  ],
};
