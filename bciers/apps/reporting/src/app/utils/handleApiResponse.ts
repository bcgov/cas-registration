import { ReportValidationErrors } from "@reporting/src/app/components/shared/validation/types";
import { createGenericReportValidationError } from "@reporting/src/app/components/shared/validation/utils";

interface ApiResponse {
  error?: string;
  validation?: {
    errors?: ReportValidationErrors;
  };
}

/**
 * Normalizes API responses into the standard ReportValidationSummary format
 *
 * Handles:
 * - Response returned by endpoints
 * Returns:
 * - false when validation errors should be displayed to the user
 */
export function handleApiResponse(
  response: ApiResponse,
  setErrors: (errors?: ReportValidationErrors) => void,
): boolean {
  // Backend validation responses contain structured validation errors
  // returned by the global exception handler and validation endpoints.
  if (response?.validation?.errors?.length) {
    setErrors(response.validation.errors);
    return false;
  }

  // Convert generic API errors (e.g. UserError, ValueError, ObjectDoesNotExist)
  // into a validation error so they can be displayed consistently with form validation messages
  if (response?.error) {
    setErrors([createGenericReportValidationError(response.error)]);
    return false;
  }

  // Clear any previous errors after a successful submission
  setErrors(undefined);
  return true;
}
