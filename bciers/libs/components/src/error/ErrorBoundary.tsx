import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { Alert, AlertTitle } from "@mui/material";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";

interface Props {
  error: Error & { digest?: string };
}
export default function ErrorBoundary({ error }: Props) {
  const [eventId, setEventId] = useState<string | null>(null);
  useEffect(() => {
    if (error) {
      try {
        // Attempt to log the error to Sentry
        const id = Sentry.captureException(error);
        setEventId(id); // Store Sentry event ID
      } catch (sentryError) {
        // If there's an error logging to Sentry, log it to the console
        // eslint-disable-next-line no-console
        console.error("Error logging to Sentry:", sentryError);
      }
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
        <p>An internal server error has occured.</p>
        <p>
          Please refresh the page. If the problem persists, contact{" "}
          <a href={ghgRegulatorEmail}>ghgregulator@gov.bc.ca</a> for help and
          include the reference code:{" "}
          <strong>{eventId ? eventId : "pending"}</strong>
        </p>
      </Alert>
    </div>
  );
}
