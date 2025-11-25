"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
import {
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

type ErrorType = "value" | "promise" | "api" | "boundary";

function ErrorThrower({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error(
      "Test error boundary for Better Stack integration - This error will show the event ID",
    );
  }
  return null;
}

export default function TestSentryPage() {
  const [errorType, setErrorType] = useState<ErrorType>("value");
  const [loading, setLoading] = useState(false);
  const [triggerBoundary, setTriggerBoundary] = useState(false);

  const triggerClientError = (type: ErrorType) => {
    setLoading(true);
    try {
      switch (type) {
        case "value":
          throw new Error("Test client-side ValueError for Better Stack");

        case "promise":
          Promise.reject(
            new Error("Test client-side promise rejection for Better Stack"),
          );
          break;

        default:
          throw new Error(`Unknown error type: ${type}`);
      }
    } catch (error) {
      Sentry.captureException(error);
      setLoading(false);
      alert(
        `Error captured! Check Better Stack. Error: ${
          error instanceof Error ? error.message : "Unknown"
        }`,
      );
    }
  };

  const triggerApiError = async (type: ErrorType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/test-sentry?error_type=${type}`);
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        alert("No error occurred");
      } else {
        alert(`API Error captured! Check Better Stack. Error: ${data.error}`);
      }
    } catch (error) {
      setLoading(false);
      Sentry.captureException(error);
      alert(
        `API request failed! Check Better Stack. Error: ${
          error instanceof Error ? error.message : "Unknown"
        }`,
      );
    }
  };

  const handleTriggerError = () => {
    if (errorType === "api") {
      triggerApiError("value");
    } else if (errorType === "boundary") {
      // Trigger error boundary by setting state that causes component to throw
      setTriggerBoundary(true);
    } else {
      triggerClientError(errorType);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Test Better Stack Integration
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Select an error type and click the button to trigger an error that will
        be sent to Better Stack.
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Error Type</InputLabel>
        <Select
          value={errorType}
          label="Error Type"
          onChange={(e) => setErrorType(e.target.value as ErrorType)}
        >
          <MenuItem value="value">ValueError (Client)</MenuItem>
          <MenuItem value="api">API Error (Server)</MenuItem>
          <MenuItem value="boundary">Error Boundary (Shows Event ID)</MenuItem>
        </Select>
      </FormControl>

      <ErrorThrower shouldThrow={triggerBoundary} />

      <Button
        variant="contained"
        color="error"
        onClick={handleTriggerError}
        disabled={loading}
        fullWidth
      >
        {loading ? "Triggering Error..." : "Trigger Error"}
      </Button>
    </Box>
  );
}
