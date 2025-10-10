/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
*/

// eslint-disable-next-line import/extensions
import "@bciers/styles/globals.css";
import RootLayout, {
  generateMetadata,
} from "@bciers/components/layout/RootLayout";

const title = "Reporting";

const defaultLinks = [{ label: "Dashboard", href: "/" }, { label: title }];

export const metadata = generateMetadata(title);

export default function ReportingLayout({
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
