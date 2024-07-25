import { useEffect } from "react";
import { Alert, AlertTitle } from "@mui/material";

interface Props {
  error: Error & { digest?: string };
}
export default function ErrorBoundary({ error }: Props) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
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
        <AlertTitle>Error</AlertTitle>
        <strong>{error.message}</strong>
      </Alert>
    </div>
  );
}
