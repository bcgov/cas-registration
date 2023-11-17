/**
 * Tailwind CSS: Tailwind CSS is a utility-first CSS framework that takes a unique approach to styling websites.
 * It provides a comprehensive set of pre-defined utility classes that can be used to quickly and efficiently style HTML elements.
 * Rather than writing custom CSS, developers can leverage these utility classes to apply styles and create responsive designs.
 *
 * We need to modify the tailwind.config.js file for MUI and TailwindCSS to work correctly.
 *  You can read more about it here in the MUI documentation: https://mui.com/material-ui/guides/interoperability/#setup.
 * */

/** @type {import('tailwindcss').Config} */
import {
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
  BC_GOV_BACKGROUND_COLOR_BLUE,
  BC_GOV_LINKS_COLOR,
  DARK_GREY_BG_COLOR,
  LIGHT_GREY_BG_COLOR,
} from "./app/styles/colors";

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/components/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  // Add the important option, using the id of the app wrapper in layout.tsx
  important: "#__next",
  //It is best practice while using Tailwind and MUI together to add a prefix in the tailwind class
  //After adding a prefix you can use your classes for padding like this way: tw-p-4 and for text size
  //prefix: 'tw-',   //👈 Use your desired prefix
  theme: {
    extend: {
      colors: {
        "bc-gov-primary-brand-color-blue": BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
        "bc-gov-background-color-blue": BC_GOV_BACKGROUND_COLOR_BLUE,
        "bc-gov-links-color": BC_GOV_LINKS_COLOR,
        "dark-grey-bg-color": DARK_GREY_BG_COLOR,
        "light-grey-bg-color": LIGHT_GREY_BG_COLOR,
      },
    },
  },
  plugins: [],
};
