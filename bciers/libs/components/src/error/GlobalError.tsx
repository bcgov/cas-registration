"use client";

import ErrorComponent from "@bciers/components/error/ErrorBoundary";

export default function GlobalError({
  error,
}: Readonly<{
  error: Error & { digest?: string };
}>) {
  return <ErrorComponent error={error} />;
}
