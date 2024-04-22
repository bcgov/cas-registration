# CSS theming guide

## Globals

Colour variables are stored in the `colors.ts` file located in [`/client/app/styles/colors.ts`](/client/app/styles/colors.ts)

Global CSS resets as well as custom Tailwind classes using `@apply`can be set in the `globals.css` file located in [`/client/app/styles/globals.css`](/client/app/styles/globals.css)

## Tailwind

[Tailwind CSS](https://tailwindcss.com/) is a popular utility-first CSS framework that is designed to simplify and streamline the process of building modern, responsive web interfaces. It focuses on providing a set of highly reusable utility classes that you can apply directly to your HTML elements to style and structure.

The Tailwind configuration file is located in [`/client/tailwind.config.css`](/client/tailwind.config.js). Here we can extend the theme and set custom variables for things such as colours and widths.

Custom Tailwind classes using `@apply` can be set in the `globals.css` file located in [`/client/app/styles/globals.css`](/client/app/styles/globals.css)

Tailwind has been configured to work with MUI within client/tailwind.config.js as per [intergration documentation](https://mui.com/material-ui/guides/interoperability/#tailwind-css)

You can use Tailwind CSS classes to style Material-UI components by applying the classes directly to the Material-UI components in your JSX.

```
import { Button, Paper } from '@mui/material';

function MyComponent() {
  return (
    <Paper className="p-4">
      <Button className="bg-blue-500 hover:bg-blue-700 text-white">Click Me</Button>
    </Paper>
  );
}
```

**Optional:** It is best practice while using Tailwind and MUI together to add a prefix in the tailwind class and by setting tailwind to important so that class conflicts are reduced between these two libraries.

```js
// tailwind.config.js
module.exports = {
  prefix: 'tw-',   👈 Use your desired prefix
}
```

## Material UI (MUI)

[Material-UI (MUI)](https://mui.com/material-ui/getting-started/) is a popular open-source UI framework for React applications that is based on Google's Material Design guidelines. It provides a wide range of reusable and customizable components and styles to help you build modern, attractive, and responsive web applications

Material-UI has been configured for Next.js app router using a theme registry component (/cas-registration/client/app/components/theme/ThemeRegistry.tsx) as a provider to the children within the root layout (/cas-registration/client/app/layout.tsx) and providing config option in client/next.config.js.

This project uses Material UI for many components and inputs. Styles can be applied using the `sx` prop and regular CSS or using the `classNames` prop with Tailwind classes.

[https://mui.com/base-ui/guides/working-with-tailwind-css/](https://mui.com/base-ui/guides/working-with-tailwind-css/)

The MUI theme is located in [`/client/app/components/theme`](/client/app/components/theme). Here we can override the default MUI palette, typography and more.
