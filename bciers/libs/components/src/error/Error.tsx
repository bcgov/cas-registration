"use client";

import ErrorComponent from "@bciers/components/error/ErrorBoundary";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);
  return <ErrorComponent error={error} reset={reset} />;
}
