import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

import { Alert, AlertTitle } from "@mui/material";

interface Props {
  error: Error & { digest?: string };
}
export default function ErrorBoundary({ error }: Props) {
  useEffect(() => {
    if (error) {
      try {
        // Attempt to log the error to Sentry
        Sentry.captureException(error);
      } catch (sentryError) {
        // If there's an error logging to Sentry, log it to the console
        // eslint-disable-next-line no-console
        console.error("Error logging to Sentry:", sentryError);
      }
      // Log the original error to the console
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center text-bc-gov-links-color">
      <h2>Something went wrong...</h2>
      <Alert
        severity="error"
        sx={{
          width: "100%",
          maxWidth: "600px",
          marginBottom: "1rem",
        }}
      >
        <AlertTitle>
          <strong>Error</strong>
        </AlertTitle>
        <div style={{ whiteSpace: "pre-wrap" }}>
          <strong>{error.message}</strong>
        </div>
      </Alert>
    </div>
  );
}
