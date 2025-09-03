/** @type {import('tailwindcss').Config} */

// Need to use relative import as TS module path does not work here
import {
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
  BC_GOV_BACKGROUND_COLOR_BLUE,
  BC_GOV_BACKGROUND_COLOR_GREY,
  BC_GOV_COMPONENTS_GREY,
  BC_GOV_DEVELOPMENT_PINK,
  BC_GOV_TEXT,
  BC_GOV_LINKS_COLOR,
  BC_GOV_YELLOW,
  BC_GOV_SEMANTICS_RED,
  BC_GOV_SEMANTICS_GREEN,
  DARK_GREY_BG_COLOR,
  LIGHT_GREY_BG_COLOR,
  LIGHT_GREY_COLOR_200,
  LIGHT_GREY_COLOR_300,
  LIGHT_BLUE_BG_COLOR,
  WHITE,
} from "./libs/styles/src";

module.exports = {
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
        "bc-text": BC_GOV_TEXT,
        "bc-primary-blue": BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
        "bc-development-pink": BC_GOV_DEVELOPMENT_PINK,
        "bc-bg-blue": BC_GOV_BACKGROUND_COLOR_BLUE,
        "bc-link-blue": BC_GOV_LINKS_COLOR,
        "bc-yellow": BC_GOV_YELLOW,
        "bc-bg-dark-grey": DARK_GREY_BG_COLOR,
        "bc-bg-light-grey": LIGHT_GREY_BG_COLOR,
        "bc-light-grey-200": LIGHT_GREY_COLOR_200,
        "bc-light-grey-300": LIGHT_GREY_COLOR_300,
        "bc-bg-grey": BC_GOV_BACKGROUND_COLOR_GREY,
        "bc-component-grey": BC_GOV_COMPONENTS_GREY,
        "bc-success-green": BC_GOV_SEMANTICS_GREEN,
        "bc-error-red": BC_GOV_SEMANTICS_RED,
        "bc-light-blue": LIGHT_BLUE_BG_COLOR,
        "bc-white": WHITE,
      },
      lineHeight: {
        12: "48px",
      },
    },
  },
  plugins: [],
};
