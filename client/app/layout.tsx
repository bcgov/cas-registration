/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
The root layout must define <html> and <body> tags.
You should not manually add <head> tags such as <title> and <meta> to root layouts. Instead, you should use the Metadata API which automatically handles advanced requirements such as streaming and de-duplicating <head> elements.
*/

import ThemeRegistry from "@/components/theme/ThemeRegistry";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Box } from "@mui/material";

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
      <body>
        <Header />
        <ThemeRegistry>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: "background.default",
              ml: `48px`,
              mt: ["48px", "56px", "64px"],
              p: 3,
            }}
          >
            {children}
          </Box>{" "}
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}
