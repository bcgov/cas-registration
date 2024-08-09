/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
*/

// eslint-disable-next-line import/extensions
import "@bciers/styles/globals.css";
import RootLayout, { rootMetadata } from "@bciers/components/layout/RootLayout";

const defaultLinks = [
  { label: "Dashboard", href: "/" },
  { label: "Reporting", href: "/reporting" },
];

export const metadata = {
  ...rootMetadata,
  title: `${rootMetadata.title} | Reporting`,
};

export default function ReportingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootLayout defaultLinks={defaultLinks} zone="reporting">
      {children}
    </RootLayout>
  );
}
