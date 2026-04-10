// Reflects backend Severity enum
export type ValidationSeverity = "Error" | "Warning";

// Keys used to identify validation errors returned from backend
export type ReportValidationMessageKey =
  // Missing required inputs / confirmations
  | "missing_report_verification"
  | "verification_statement"
  | "missing_required_attachment_confirmation"
  | "missing_existing_attachment_confirmation"
  | "missing_supplementary_report_version_change"
  | "missing_supplementary_report_attachment_confirmation"
  // Errors (data issues / validation failures)
  | "allocation_mismatch"
  | "error_operation_information"
  | "error_lime_kiln"
  | "error_activity_value"
  | "generic_error";

// Additional metadata returned from backend used for dynamic content
// (links, expected values, etc.)
export interface ReportValidationErrorContext {
  reportVersionId?: number;
  facilityId?: string;
  activityId?: number;

  activityName?: string;
  fuelType?: string;
  fieldName?: string;
  expectedRange?: string;
  userInput?: string | number | null;

  facilityName?: string;
  emissionCategoryName?: string;
  emissionCategoryId?: number;
  sourceActivityName?: string;
  targetProductName?: string;
}

// Structured validation error stored in state and passed through components
export interface ReportValidationError {
  severity: ValidationSeverity;
  message?: string;
  context?: ReportValidationErrorContext;
}

// A single validation item combining the key and its error details
export interface ReportValidationItem {
  key: ReportValidationMessageKey;
  error: ReportValidationError;
}

// A collection of validation items returned from backend / stored in state
export type ReportValidationErrors = ReportValidationItem[];

// Determines the layout strategy for rendering validation feedback in the UI
export type ValidationRenderMode =
  | "message_only"
  | "label_then_message"
  | "inline_link";

// Arguments used when formatting validation messages
export type ValidationTextArgs = {
  label?: string;
  message: string;
  error: ReportValidationError;
};

/**
 * UI configuration per validation key.
 *
 * Frontend mapping layer between:
 * - backend validation keys
 * - frontend rendering
 */
export type ValidationUIConfig = {
  label?: string | ((error: ReportValidationError) => string | undefined);
  getHref?: (ctx?: ReportValidationErrorContext) => string | undefined;
  getMessage?: (error: ReportValidationError) => string;
  renderMode?: ValidationRenderMode;
  formatMessage?: (args: ValidationTextArgs) => string;
};
