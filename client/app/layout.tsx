/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
The root layout must define <html> and <body> tags.
You should not manually add <head> tags such as <title> and <meta> to root layouts. Instead, you should use the Metadata API which automatically handles advanced requirements such as streaming and de-duplicating <head> elements.
*/

import "@/app/styles/globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SessionProvider from "@/app/components/auth/SessionProvider";
import type { Metadata, Viewport } from "next";

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
  // Invoke the nextauth server side session fetcher function getServerSession
  // Wrap the returned auth session in the "use client" version of NextAuth SessionProvider
  // to expose the useSession hook in client components
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      {
        //👇️ Used to mark the root element where Next.js will mount the client-side React application
      }
      <body id="__next">
        {/* 👇️  NextAuth SessionProvider available to client children via useSession */}
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
