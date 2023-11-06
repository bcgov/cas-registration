/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
The root layout must define <html> and <body> tags.
You should not manually add <head> tags such as <title> and <meta> to root layouts. Instead, you should use the Metadata API which automatically handles advanced requirements such as streaming and de-duplicating <head> elements.
*/

import "@/app/styles/globals.css";
import { getServerSession } from "next-auth";
import SessionProvider from "@/app/components/auth/SessionProvider";
import ThemeRegistry from "@/app/components/theme/ThemeRegistry";
import type { Metadata, Viewport } from "next";
// 🏷 import {named} can be significantly slower than import default
import Box from "@mui/material/Box";

export const metadata: Metadata = {
  title: "CAS OBPS REGISTRATION",
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
  readonly children: React.ReactNode;
}) {
  // Invoke the nextauth server side session fetcher fucntion getServerSessio
  // Wrap the returned auth session in SessionProvider to expose the useSession function in client components
  const session = await getServerSession();

  return (
    <html lang="en">
      {
        //👇️ Used to mark the root element where Next.js will mount the client-side React application
      }
      <body id="__next">
        {/* 👇️  NextAuth SessionProvider available to client children via useSession */}
        <SessionProvider session={session}>
          {
            //👇️ provide MUI custom theme to the components within the layout
          }
          <ThemeRegistry>
            {/*
          MUI Box component is a versatile and essential building block in Material-UI v5.
          It serves as a wrapper element that helps structure and organize the layout of your application.
          One of the Box component's strengths is its ability to create responsive layouts easily...
          utilizing Box component's sx prop to create a responsive layout...
          You can use properties like display, flexDirection, alignItems, justifyContent and more to control the arrangement and alignment of elements within a flex container
          */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                margin: "0 auto",
                maxWidth: "1536px",
                padding: "0 16px",
              }}
            >
              {/* Content goes here */}
              {children}
            </Box>
          </ThemeRegistry>
        </SessionProvider>
      </body>
    </html>
  );
}
