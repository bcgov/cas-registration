/*
A layout is UI that is shared between routes.
The app directory must include a root app/layout.js.
*/

// eslint-disable-next-line import/extensions
import '@bciers/styles/globals.css';
import { RootLayout } from '@bciers/components/server';
const defaultLinks = [
  { label: 'Dashboard', href: '/' },
  { label: 'Registration', href: '/registration' },
];
export default function ReportingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootLayout defaultLinks={defaultLinks} zone="registration">
      {children}
    </RootLayout>
  );
}
