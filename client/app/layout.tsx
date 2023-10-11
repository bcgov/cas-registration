/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
The root layout must define <html> and <body> tags.
You should not manually add <head> tags such as <title> and <meta> to root layouts. Instead, you should use the Metadata API which automatically handles advanced requirements such as streaming and de-duplicating <head> elements.
*/

import "@/styles/globals.css";
import ThemeRegistry from "@/components/theme/ThemeRegistry";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "CAS OBPS REGISTRATION",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body id="__next">
        <ThemeRegistry>
          <Header />
          {children}
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}
