# CSS theming guide

## Globals

Colour variables are stored in the `colors.js` file located in [`/bciers/libs/styles/src/colors.js`](/bciers/libs/styles/src/colors.js)

Global CSS resets as well as custom Tailwind classes using `@apply`can be set in the `globals.css` file located in [`/bciers/libs/styles/src/globals.css`](/bciers/libs/styles/src/globals.css)

## Tailwind

[https://tailwindcss.com/](https://tailwindcss.com/)

We use Tailwind CSS v4, which is configured in CSS (there is no `tailwind.config.js`). All apps share a single entry point: [`/bciers/libs/styles/src/globals.css`](/bciers/libs/styles/src/globals.css). In that file:

- Theme values such as the `bc-*` colours are defined in the `@theme` block. Keep them in sync with `colors.js`, which the MUI theme uses.
- Custom classes are defined with `@utility`, so they can be used with variants (e.g. `hover:box-shadow-tile`) and in other `@apply` rules.
- `@source` lists the folders scanned for class names. Class names must appear as complete strings in the source (e.g. not `text-${color}`), otherwise they won't be generated.
- Preflight is not imported, and utilities are marked `important` so they override MUI's styles.

See the [Tailwind CSS v4 docs](https://tailwindcss.com/docs/theme) for details.

### Conventions

- **Prefer Tailwind classes over `style` and `sx`.** Keep `sx` for things classes can't express cleanly: MUI breakpoint objects (`{ xs: …, lg: … }`, which use MUI's breakpoints, not Tailwind's), theme palette strings like `"warning.main"`, larger nested MUI selector groups (e.g. `"& .MuiTab-root": {…}`), and shared style objects. Keep `style` only for values computed at runtime (e.g. a colour from a status map).
- **Use theme colours, not hex values or colour constants.** E.g. `text-bc-link-blue` instead of `style={{ color: BC_GOV_LINKS_COLOR }}`. To add a colour, add it to `@theme` in `globals.css` (and to `colors.js` if MUI needs it too).
- **Use the spacing scale instead of pixel values.** Any multiple of 0.25 works (1 = 4px), e.g. `px-3.5` (14px), `mb-7.5` (30px), `max-w-150` (600px). Use fractions for percentages (`w-7/10`). Note that MUI's spacing unit is 8px, so `sx={{ mb: 2 }}` is `mb-4`.
- **Font size without changing line height:** `text-base` also sets a line height. Use a bracket size (`text-[16px]`) or a line-height modifier (`text-sm/normal`) when only the size should change, e.g. inside MUI DataGrid cells, which use a 1.43 line height.
- **Short nested selectors and media queries** can be written as variants: `[&_svg]:shrink-0`, `[&_input]:p-2`, `print:hidden`.
- **Class names must be complete strings.** Write `isActive ? "text-white" : "text-bc-text"`, not `text-${color}`.

### Things to watch out for

- **Utilities override inline styles.** Because utilities are `!important`, a class like `w-fit` beats `style={{ width: "300px" }}`, including styles passed to rjsf templates through `ui:options.style`. Don't set the same property with both a class and an inline style or `sx`.
- **Custom `@utility` classes override MUI too.** For example, `form-heading` includes `mb-4`, which overrides MUI `Typography`'s `margin: 0`. Add an explicit utility (e.g. `mb-0`) when you want a different value.
- **Border utilities include a solid style.** `border`, `border-t`, etc. now draw a visible border on their own. In Tailwind v3 (with Preflight disabled) they also needed `border-solid`.
- **Font-size utilities use a unitless line-height** (e.g. `text-2xl` → `1.333`). Children with a different font size get a line-height relative to their own size. Set `leading-*` explicitly if you need a fixed line height, e.g. `md:text-[28px] md:leading-7`.
- **`hover:` only applies on devices that support hover**, so touch screens don't get stuck hover styles.

## Material UI (MUI)

[https://mui.com/material-ui/](https://mui.com/material-ui/)

This project uses Material UI for many components and inputs. Styles can be applied using the `sx` prop and regular CSS or using the `classNames` prop with Tailwind classes.

[https://mui.com/base-ui/guides/working-with-tailwind-css/](https://mui.com/base-ui/guides/working-with-tailwind-css/)

The MUI theme is located in [`/bciers/libs/components/src/theme`](/bciers/libs/components/src/theme). Here we can override the default MUI palette, typography and more.
