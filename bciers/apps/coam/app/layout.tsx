/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
*/

// eslint-disable-next-line import/extensions
import "@bciers/styles/globals.css";
import RootLayout, { rootMetadata } from "@bciers/components/layout/RootLayout";

const defaultLinks = [
  { label: "Dashboard", href: "/" },
  { label: "COAM", href: "/coam" },
];

export const metadata = {
  ...rootMetadata,
  title: `${rootMetadata.title} | COAM`,
};

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
