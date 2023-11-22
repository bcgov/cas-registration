import { useEffect } from "react";
import { Button } from "@mui/material";
import { Alert, AlertTitle } from "@mui/material";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}
export default function ErrorBoundary({ error, reset }: Props) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center text-bc-gov-links-color">
      <Alert
        severity="error"
        sx={{
          width: "100%",
          maxWidth: "600px",
          marginBottom: "1rem",
        }}
      >
        <AlertTitle>Error</AlertTitle>
        <strong>{error.message}</strong>
      </Alert>

      <h2>Something went wrong!</h2>
      <Button
        className="w-fit"
        variant="contained"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}
