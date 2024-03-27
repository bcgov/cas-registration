import './global.css';
import {
  metadata as regMetadata,
  default as RegRootLayout,
  viewport as regViewport,
} from 'registration/layout';

export const metadata = regMetadata;
export const viewport = regViewport;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body id="__next">{children}</body>
    </html>
  );
}
