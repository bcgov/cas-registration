/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
*/

// eslint-disable-next-line import/extensions
import "@bciers/styles/globals.css";
import { RootLayout } from "@bciers/components/server";
const defaultLinks = [
  { label: "Dashboard", href: "/" },
  { label: "COAM", href: "/coam" },
];
export default function COAMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootLayout defaultLinks={defaultLinks} zone="coam">
      {children}
    </RootLayout>
  );
}
