import { ReportValidationErrors } from "@reporting/src/app/components/shared/validation/types";
import { createGenericReportValidationError } from "@reporting/src/app/components/shared/validation/utils";

export function handleFormResponse(
  response: any,
  setErrors: (errors?: ReportValidationErrors) => void,
): boolean {
  if (response?.validation?.errors?.length) {
    setErrors(response.validation.errors);
    return false;
  }

  if (response?.error) {
    setErrors([createGenericReportValidationError(response.error)]);
    return false;
  }

  setErrors(undefined);
  return true;
}
