# CSS theming guide

## Globals

Colour variables are stored in the `colors.ts` file located in [`/bciers/apps/registration1/app/styles/colors.ts`](/bciers/apps/registration1/app/styles/colors.ts)

Global CSS resets as well as custom Tailwind classes using `@apply`can be set in the `globals.css` file located in [`/bciers/apps/registration1/app/styles/globals.css`](/bciers/apps/registration1/app/styles/globals.css)

## Tailwind

[https://tailwindcss.com/](https://tailwindcss.com/)

The Tailwind configuration file is located in [`/bciers/apps/registration1/tailwind.config.css`](/bciers/apps/registration1/tailwind.config.js). Here we can extend the theme and set custom variables for things such as colours and widths.

Custom Tailwind classes using `@apply` can be set in the `globals.css` file located in [`/bciers/apps/registration1/app/styles/globals.css`](/bciers/apps/registration1/app/styles/globals.css)

## Material UI (MUI)

[https://mui.com/material-ui/](https://mui.com/material-ui/)

This project uses Material UI for many components and inputs. Styles can be applied using the `sx` prop and regular CSS or using the `classNames` prop with Tailwind classes.

[https://mui.com/base-ui/guides/working-with-tailwind-css/](https://mui.com/base-ui/guides/working-with-tailwind-css/)

The MUI theme is located in [`/bciers/apps/registration1/app/components/theme`](/bciers/apps/registration1/app/components/theme). Here we can override the default MUI palette, typography and more.
