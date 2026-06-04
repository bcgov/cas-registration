import { useState, useMemo } from "react";
import { ReportValidationErrors } from "@reporting/src/app/components/shared/validation/types";
import ReportValidationSummary from "@reporting/src/app/components/shared/validation/ReportValidationSummary";

/**
 * Custom hook to centralize form validation state management
 * It manages raw error states and automatically formats them into a stable JSX array
 */
export function useFormErrors(initialErrors?: ReportValidationErrors) {
  // Raw state containing backend validation errors
  const [errors, setErrors] = useState<ReportValidationErrors | undefined>(
    initialErrors,
  );
  // Reactive layout formatter
  // useMemo ensures the array reference remains stable across renders
  const renderedErrors = useMemo(() => {
    if (!errors || errors.length === 0) return undefined;
    // Wrap the summary component
    return [
      <ReportValidationSummary key="validation-errors" errors={errors} />,
    ];
  }, [errors]);

  return {
    errors, // API error response
    setErrors, // Passed into API response handler
    renderedErrors, // Passed into Form wrapper
  };
}
