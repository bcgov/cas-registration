import "@bciers/styles/globals.css";
import SessionProvider from "@/dashboard/auth/SessionProvider";
import type { Metadata, Viewport } from "next";
import { auth } from "@/dashboard/auth";
import { PublicEnvScript } from "next-runtime-env";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { theme } from "@bciers/components";
import { NextAppDirEmotionCacheProvider } from "@bciers/components";
import CssBaseline from "@mui/material/CssBaseline";

import Box from "@mui/material/Box";
import { Footer } from "@bciers/components";
import { Header } from "@bciers/components";
import { Bread } from "@bciers/components";
import { Main } from "@bciers/components/server";

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

// 📐 type for root layout props
type RootLayoutProps = {
  children: React.ReactNode;
  defaultLinks?: { label: string; href: string }[]; // for breadcrumbs
};

export default async function RootLayout({
  children,
  defaultLinks,
}: RootLayoutProps) {
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
                  defaultLinks={defaultLinks} // Pass defaultLinks as a prop
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
