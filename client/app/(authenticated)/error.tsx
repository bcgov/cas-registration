"use client"; // Error components must be Client Components

import { useEffect } from "react";
import ErrorComponent from "@/app/components/Error";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: any;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return <ErrorComponent error={error} reset={reset} />;
}
