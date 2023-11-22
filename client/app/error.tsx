"use client"; // Error components must be Client Components

import ErrorComponent from "@/app/components/Error";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorComponent error={error} reset={reset} />;
}
