"use client";

import ErrorBoundary from "@bciers/components/error/ErrorBoundary";

export default function ErrorPage({
  error,
}: Readonly<{
  error: Error & { digest?: string };
}>) {
  return <ErrorBoundary error={error} />;
}
