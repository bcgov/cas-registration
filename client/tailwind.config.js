/** we need to modify the tailwind.config.js file for MUI and TailwindCSS to work correctly.
 *  You can read more about it here in the MUI documentation: https://mui.com/material-ui/guides/interoperability/#setup.*/
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/components/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  important: "#__next",
  theme: {
    extend: {},
  },
  plugins: [],
};
