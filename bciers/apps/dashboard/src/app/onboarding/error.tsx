"use client"; // Error components must be Client Components

import ErrorComponent from "@/app/components/Error";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function ErrorBoundary({
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
