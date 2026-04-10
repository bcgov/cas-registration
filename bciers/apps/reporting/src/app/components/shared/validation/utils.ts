import { validationUIConfig } from "./config";
import type {
  ReportValidationError,
  ReportValidationItem,
  ReportValidationMessageKey,
  ValidationUIConfig,
  ValidationSeverity,
} from "./types";

// Returns full UI config for a validation key
export function getValidationUIConfig(
  key: ReportValidationMessageKey,
): ValidationUIConfig | undefined {
  return validationUIConfig[key];
}

// Returns navigation URL from config + error context
export function getValidationErrorHref(
  key: ReportValidationMessageKey,
  error: ReportValidationError,
): string | undefined {
  return validationUIConfig[key]?.getHref?.(error.context);
}

// Resolves the display label for the validation error
export function getValidationErrorLabel(
  key: ReportValidationMessageKey,
  error: ReportValidationError,
): string | undefined {
  const label = validationUIConfig[key]?.label;
  return typeof label === "function" ? label(error) : label;
}

// Returns message
export function getValidationErrorMessage(
  key: ReportValidationMessageKey,
  error: ReportValidationError,
): string {
  return validationUIConfig[key]?.getMessage?.(error) ?? error.message ?? key;
}

// Applies optional custom formatting to message
export function getFormattedValidationMessage(
  key: ReportValidationMessageKey,
  error: ReportValidationError,
): string {
  const config = validationUIConfig[key];
  const label = getValidationErrorLabel(key, error);
  const message = getValidationErrorMessage(key, error);

  if (config?.formatMessage) {
    return config.formatMessage({ label, message, error });
  }

  return message;
}

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
