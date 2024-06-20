/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
The root layout must define <html> and <body> tags.
You should not manually add <head> tags such as <title> and <meta> to root layouts. Instead, you should use the Metadata API which automatically handles advanced requirements such as streaming and de-duplicating <head> elements.
*/

// eslint-disable-next-line import/extensions
import "@bciers/styles/globals.css";
import SessionProvider from "@/dashboard/auth/SessionProvider";
import type { Metadata, Viewport } from "next";
// 🏷 import {named} can be significantly slower than import default
import { auth } from "@/dashboard/auth";
import { PublicEnvScript } from "next-runtime-env";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { theme } from "@bciers/components";
import { NextAppDirEmotionCacheProvider } from "@bciers/components";
import CssBaseline from "@mui/material/CssBaseline";
import Footer from "@bciers/components/layout/Footer";
import Header from "@bciers/components/layout/Header";
import Bread from "@bciers/components/navigation/Bread";
import Main from "@bciers/components/layout/Main";

export const metadata: Metadata = {
  title: "CAS OBPS",
  description:
    "The OBPS is designed to ensure there is a price incentive for industrial emitters to reduce their greenhouse gas emissions and spur innovation while maintaining competitiveness and protecting against carbon leakage.",
  icons: {
    icon: "/img/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  //🪝 Wrap the returned auth session in the "use client" version of NextAuth SessionProvider so to expose the useSession() hook in client components

  const session = await auth();

  return (
    <html lang="en">
      {
        //👇️ Used to mark the root element where Next.js will mount the client-side React application
      }
      <head>
        <PublicEnvScript />
      </head>
      <body id="__next">
        <SessionProvider
          // 👇 Notice that the basePath to the auth management site
          basePath={`${process.env.NEXTAUTH_URL}/api/auth`}
          session={session}
        >
          {
            //👇️ provide MUI custom theme to the components within the layout
            // ThemeRegistry component does not properly import, so we import the individual pieces separately.
          }
          <NextAppDirEmotionCacheProvider options={{ key: "mui" }}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Header />
              <Bread
                separator={<span aria-hidden="true"> &gt; </span>}
                capitalizeLinks
              />
              <Main>{children}</Main>
              <Footer />
            </ThemeProvider>
          </NextAppDirEmotionCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
