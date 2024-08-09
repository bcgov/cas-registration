/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
*/

// eslint-disable-next-line import/extensions
import "@bciers/styles/globals.css";

import RootLayout, { rootMetadata } from "@bciers/components/layout/RootLayout";

const title = "Administration";

const defaultLinks = [
  { label: "Dashboard", href: "/" },
  { label: title, href: "/administration" },
];

export const metadata = {
  ...rootMetadata,
  title: `${rootMetadata.title} | ${title}`,
};

export default function AdministrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootLayout defaultLinks={defaultLinks} zone={title.toLowerCase()}>
      {children}
    </RootLayout>
  );
}
