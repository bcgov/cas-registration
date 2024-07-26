"use client";

import ErrorComponent from "@bciers/components/error/ErrorBoundary";

export default function Error({
  error,
}: Readonly<{
  error: Error & { digest?: string };
}>) {
  return <ErrorComponent error={error} />;
}
