/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
*/

import "@bciers/styles/globals.css";
import RootLayout, {
  generateMetadata,
} from "@bciers/components/layout/RootLayout";
import { auth } from "@/dashboard/auth";
import type { Metadata } from "next";

const title = "Registration";

const defaultLinks = [{ label: "Dashboard", href: "/" }, { label: title }];

export const metadata: Metadata = generateMetadata(title);

export default async function RegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <RootLayout
      defaultLinks={defaultLinks}
      zone={title.toLowerCase()}
      session={session}
    >
      {children}
    </RootLayout>
  );
}
