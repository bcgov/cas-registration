import type { ReportValidationItem, ValidationSeverity } from "./types";

export function createGenericReportValidationError(
  message: string,
  severity: ValidationSeverity = "Error",
): ReportValidationItem {
  return {
    key: "generic_error",
    error: {
      severity,
      message,
    },
  };
}
