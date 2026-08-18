import type {
  ValidationErrors,
  ValidationItem,
  ValidationItemError,
  ValidationUIConfig as GenericValidationUIConfig,
  ValidationUIConfigInput as GenericValidationUIConfigInput,
} from "@bciers/components/validationErrors";

// Re-export base generic types for local use across reporting components
export type {
  ValidationSeverity,
  ValidationRenderMode,
  ValidationItemError,
  ValidationItem,
  ValidationErrors,
  ValidationTextArgs,
} from "@bciers/components/validationErrors";

/**
 * All error keys that can be returned by the reporting backend.
 */
export type ValidationMessageKey =
  | "error_required_fields"
  | "operation_boro_id"
  | "report_data_out_of_bounds_by_fuel_type"
  | "report_data_out_of_bounds_by_reporting_field"
  | "allocation_mismatch"
  | "missing_report_verification"
  | "verification_statement"
  | "report_activity_json_validation"
  | "attachment_not_scanned"
  | "missing_supplementary_report_required_attachment_confirmation"
  | "missing_supplementary_report_existing_attachment_confirmation"
  | "missing_supplementary_report_attachments_confirmation"
  | "missing_supplementary_report_version_change"
  | "missing_regulated_product"
  | "og_np_nc_allocation_mismatch"
  | "missing_operation_representative"
  | "generic_error";

// Specialized reporting types bound to ValidationMessageKey
export type ValidationError = ValidationItemError;
export type ValidationItemType = ValidationItem<ValidationMessageKey>;
export type ReportValidationErrors = ValidationErrors<ValidationMessageKey>;
export type ValidationUIConfig =
  GenericValidationUIConfig<ValidationMessageKey>;
export type ValidationUIConfigInput =
  GenericValidationUIConfigInput<ValidationMessageKey>;
