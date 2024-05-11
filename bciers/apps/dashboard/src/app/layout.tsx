import './global.css';

import SessionProvider from '@/dashboard/auth/SessionProvider';
import { auth } from '@/dashboard/auth';
export const metadata = {
  title: 'Welcome to home',
  description: 'Generated by create-nx-workspace',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en">
      {' '}
      <SessionProvider session={session}>
        <body>{children}</body>
      </SessionProvider>
    </html>
  );
}
