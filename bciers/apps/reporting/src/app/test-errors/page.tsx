"use client";

/**
 * Test page for error tracking POC (Raygun).
 *
 * This page allows testing various types of errors to verify
 * error tracking integration.
 */
import { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import { sendErrorToRaygun, setRaygunUser } from "@bciers/sentryConfig/raygun";

type ErrorType =
  | "reference_error"
  | "type_error"
  | "syntax_error"
  | "custom_error";

export default function TestErrorsPage() {
  const [errorType, setErrorType] = useState<ErrorType>("reference_error");
  const [errorTriggered, setErrorTriggered] = useState(false);

  const triggerError = () => {
    setErrorTriggered(true);

    try {
      switch (errorType) {
        case "reference_error":
          // @ts-expect-error - Intentionally accessing undefined variable
          const result = undefinedVariable.someMethod();
          break;
        case "type_error":
          // @ts-expect-error - Intentionally calling null as function
          const nullFunc: any = null;
          nullFunc();
          break;
        case "syntax_error":
          // This will be caught at compile time, so we'll throw a SyntaxError manually
          throw new SyntaxError("Test SyntaxError for error tracking POC");
        case "custom_error":
          throw new Error("Test custom error for error tracking POC");
        default:
          throw new Error("Unknown error type");
      }
    } catch (error) {
      // Send error to Raygun
      if (error instanceof Error) {
        sendErrorToRaygun(error, ["test", "frontend", errorType], {
          testPage: true,
          errorType,
          timestamp: new Date().toISOString(),
        });
      }

      // Re-throw to see in console
      throw error;
    }
  };

  const triggerAsyncError = async () => {
    setErrorTriggered(true);

    try {
      // Simulate an async error
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error("Test async error for error tracking POC"));
        }, 100);
      });
    } catch (error) {
      if (error instanceof Error) {
        sendErrorToRaygun(error, ["test", "frontend", "async_error"], {
          testPage: true,
          errorType: "async_error",
          timestamp: new Date().toISOString(),
        });
      }
      throw error;
    }
  };

  const triggerUnhandledError = () => {
    setErrorTriggered(true);

    // This will trigger an unhandled error that Raygun should catch
    setTimeout(() => {
      // @ts-expect-error - Intentionally accessing undefined
      window.nonExistentFunction();
    }, 100);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Error Tracking Test Page (Raygun POC)
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
        This page is for testing error tracking integration with Raygun. Use the
        buttons below to trigger different types of errors.
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Error Type</InputLabel>
          <Select
            value={errorType}
            label="Error Type"
            onChange={(e) => {
              setErrorType(e.target.value as ErrorType);
              setErrorTriggered(false);
            }}
          >
            <MenuItem value="reference_error">ReferenceError</MenuItem>
            <MenuItem value="type_error">TypeError</MenuItem>
            <MenuItem value="syntax_error">SyntaxError</MenuItem>
            <MenuItem value="custom_error">Custom Error</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="error"
          onClick={triggerError}
          sx={{ mr: 2, mb: 2 }}
        >
          Trigger {errorType.replace("_", " ")} Error
        </Button>

        <Button
          variant="contained"
          color="warning"
          onClick={triggerAsyncError}
          sx={{ mr: 2, mb: 2 }}
        >
          Trigger Async Error
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={triggerUnhandledError}
          sx={{ mb: 2 }}
        >
          Trigger Unhandled Error
        </Button>
      </Paper>

      {errorTriggered && (
        <Paper sx={{ p: 2, bgcolor: "warning.light" }}>
          <Typography variant="body2">
            Error triggered! Check the Raygun dashboard to see if the error was
            captured.
          </Typography>
        </Paper>
      )}

      <Paper sx={{ p: 2, mt: 3, bgcolor: "info.light" }}>
        <Typography variant="h6" gutterBottom>
          Server-Side Error Testing
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          To test Next.js server-side errors (API routes), use:
        </Typography>
        <Typography
          variant="body2"
          component="code"
          sx={{ display: "block", p: 1, bgcolor: "grey.100", mb: 2 }}
        >
          GET /reporting/api/test-errors?error_type=runtime_error
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Available error types: runtime_error, value_error, type_error
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Django Backend Error Testing
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          To test Django backend errors, use:
        </Typography>
        <Typography
          variant="body2"
          component="code"
          sx={{ display: "block", p: 1, bgcolor: "grey.100" }}
        >
          GET /api/common/test-errors/backend?error_type=value_error
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Available error types: value_error, runtime_error, key_error,
          attribute_error
        </Typography>
      </Paper>
    </Box>
  );
}
