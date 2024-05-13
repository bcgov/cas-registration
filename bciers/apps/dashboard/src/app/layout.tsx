import "./global.css";

import SessionProvider from "@/dashboard/app/_components/auth/SessionProvider";
import { auth } from "@/dashboard/auth";
import { Viewport } from "next";
import Box from "@mui/material/Box";
import { PublicEnvScript } from "next-runtime-env";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { theme } from "@bciers/components";
import { NextAppDirEmotionCacheProvider } from "@bciers/components";
import CssBaseline from "@mui/material/CssBaseline";
import { Footer } from "@bciers/components";
import { Header } from "@bciers/components";

export const metadata = {
  title: "CAS OBPS",
  description:
    "The OBPS is designed to ensure there is a price incentive for industrial emitters to reduce their greenhouse gas emissions and spur innovation while maintaining competitiveness and protecting against carbon leakage.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body id="__next">
        <SessionProvider session={session}>
          {children}
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
                {/* Content goes here */}
                {children}
                <Footer />
              </Box>
            </ThemeProvider>
          </NextAppDirEmotionCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
