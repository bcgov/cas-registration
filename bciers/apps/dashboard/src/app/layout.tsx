/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
The root layout must define <html> and <body> tags.
You should not manually add <head> tags such as <title> and <meta> to root layouts. Instead, you should use the Metadata API which automatically handles advanced requirements such as streaming and de-duplicating <head> elements.
*/

import "@/app/styles/globals.css";
import SessionProvider from "@/dashboard/app/components/auth/SessionProvider";
import { auth } from "@/dashboard/auth";
import { viewport as regViewport } from "@/app/layout";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { theme } from "@bciers/components";
import { NextAppDirEmotionCacheProvider } from "@bciers/components";
import CssBaseline from "@mui/material/CssBaseline";
import { PublicEnvScript } from "next-runtime-env";

import Box from "@mui/material/Box";
import { Footer } from "@bciers/components";
import { Header } from "@bciers/components";
import { Bread } from "@bciers/components";
import { Main } from "@bciers/components/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CAS OBPS DASHBOARD",
  description:
    "The OBPS is designed to ensure there is a price incentive for industrial emitters to reduce their greenhouse gas emissions and spur innovation while maintaining competitiveness and protecting against carbon leakage.",
};

export const viewport = regViewport;

export default async function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  //🪝 Wrap the returned auth session in the "use client" version of NextAuth SessionProvider so to expose the useSession() hook in client components
  // Session properties come from client/app/api/auth/[...nextauth]/route.ts
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
              {/*
            MUI Box component is a versatile and essential building block in Material-UI v5.
            It serves as a wrapper element that helps structure and organize the layout of your application.
            One of the Box component's strengths is its ability to create responsive layouts easily...
            utilizing Box component's sx prop to create a responsive layout...
            You can use properties like display, flexDirection, alignItems, justifyContent and more to control the arrangement and alignment of elements within a flex container
            */}
              <CssBaseline />
              <Box
                sx={{
                  display: "flex",
                  minHeight: "100vh",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  margin: "0 auto",
                  maxWidth: "1536px",
                  padding: "0 16px",
                }}
              >
                <Header />
                <Bread
                  separator={<span aria-hidden="true"> &gt; </span>}
                  capitalizeLinks
                />
                <Main>{children}</Main>
                <Footer />
              </Box>
            </ThemeProvider>
          </NextAppDirEmotionCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
