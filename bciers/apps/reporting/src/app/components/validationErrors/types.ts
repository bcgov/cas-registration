import { ValidationMessageKey as SharedKey } from "@bciers/components/validationErrors";

export const localValidationKeys = [
  "error_required_fields",
  "operation_boro_id",
  "report_activity_json_validation",
  "report_data_out_of_bounds_by_fuel_type",
  "report_data_out_of_bounds_by_reporting_field",
  "allocation_mismatch",
  "missing_report_verification",
  "verification_statement",
  "attachment_not_scanned",
  "missing_supplementary_report_required_attachment_confirmation",
  "missing_supplementary_report_existing_attachment_confirmation",
  "missing_supplementary_report_attachments_confirmation",
  "missing_supplementary_report_version_change",
  "missing_regulated_product",
  "og_np_nc_allocation_mismatch",
  "missing_operation_representative",
] as const;

export type ValidationMessageKey = SharedKey<
  (typeof localValidationKeys)[number]
>;
