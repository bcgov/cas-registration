/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
The root layout must define <html> and <body> tags.
You should not manually add <head> tags such as <title> and <meta> to root layouts. Instead, you should use the Metadata API which automatically handles advanced requirements such as streaming and de-duplicating <head> elements.
*/
// eslint-disable-next-line import/extensions
import "@bciers/styles/globals.css";
import { RootLayout } from "@bciers/components/server";

export default RootLayout;
