/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
The root layout must define <html> and <body> tags.
You should not manually add <head> tags such as <title> and <meta> to root layouts. Instead, you should use the Metadata API which automatically handles advanced requirements such as streaming and de-duplicating <head> elements.
*/

import './global.css';
import {
  metadata as regMetadata,
  default as RegRootLayout,
  viewport as regViewport,
} from 'registration/layout';
import { ThemeRegistry } from '@bciers/components';

export const metadata = regMetadata;
export const viewport = regViewport;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body id="__next">
        {
          //👇️ provide MUI custom theme to the components within the layout
        }
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
