import "@bciers/styles/globals.css";
import type { Metadata, Viewport } from "next";
import type { Session } from "next-auth";
import { PublicEnvScript } from "next-runtime-env";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import CssBaseline from "@mui/material/CssBaseline";
import SessionProvider from "@bciers/components/auth/SessionProvider";
import {
  theme,
  NextAppDirEmotionCacheProvider,
  Footer,
  Header,
  Bread,
} from "@bciers/components";
import { Main } from "@bciers/components/server";
import SessionRoleContextProvider from "@bciers/utils/src/sessionRoleContext";
import {
  isCIEnvironment,
  isVitestEnvironment,
} from "@bciers/utils/src/environmentDetection";
import SessionTimeoutHandler from "@bciers/components/auth/SessionTimeoutHandler";
import SentryUserContext from "@bciers/components/sentry/SentryUserContext";

const rootMetadata: Metadata = {
  title: "CAS OBPS",
  description:
    "The OBPS is designed to ensure there is a price incentive for industrial emitters to reduce their greenhouse gas emissions and spur innovation while maintaining competitiveness and protecting against carbon leakage.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const generateMetadata = (zone: string): Metadata => {
  return {
    ...rootMetadata,
    title: `${rootMetadata.title} | ${zone}`,
  };
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// 📐 type for root layout props
type RootLayoutProps = {
  children: React.ReactNode;
  defaultLinks?: { label: string; href?: string }[]; // for breadcrumbs
  zone?: string; // for breadcrumbs
  session: Session | null; // auth session passed from app layout
};

export default async function RootLayout({
  children,
  defaultLinks,
  zone,
  session,
}: RootLayoutProps) {
  //🪝 Wrap the returned auth session in the "use client" version of NextAuth SessionProvider so to expose the useSession() hook in client components

  const showMockTimePicker =
    !isCIEnvironment() &&
    !isVitestEnvironment() &&
    ["local", "dev", "test"].includes(process.env.ENVIRONMENT as any);

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
          <SessionRoleContextProvider value={session?.user?.app_role}>
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
                  defaultLinks={defaultLinks}
                  zone={zone}
                />
                <Main>
                  <SessionTimeoutHandler />
                  <SentryUserContext />
                  {children}
                </Main>
                <Footer showMockTimePicker={showMockTimePicker} />
              </ThemeProvider>
            </NextAppDirEmotionCacheProvider>
          </SessionRoleContextProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
