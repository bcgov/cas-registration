import { validationUIConfig } from "@reporting/src/app/components/shared/validation/config";
import type { ReportValidationMessageKey } from "@reporting/src/app/components/shared/validation/types";

describe("validationUIConfig", () => {
  const expectedKeys: ReportValidationMessageKey[] = [
    "missing_report_verification",
    "verification_statement",
    "operation_boro_id",
    "report_activity_json_validation",
    "attachment_not_scanned",
    "report_data_out_of_bounds_by_fuel_type",
    "report_data_out_of_bounds_by_reporting_field",
    "allocation_mismatch",
    "missing_supplementary_report_required_attachment_confirmation",
    "missing_supplementary_report_existing_attachment_confirmation",
    "missing_supplementary_report_attachments_confirmation",
    "missing_supplementary_report_version_change",
    "error_required_fields",
    "generic_error",
  ];

  it("has the expected number of configs", () => {
    expect(Object.keys(validationUIConfig)).toHaveLength(14);
  });

  it("has a config for every validation key", () => {
    expect(Object.keys(validationUIConfig).sort()).toEqual(
      [...expectedKeys].sort(),
    );
  });

  it("all configs define a renderMode", () => {
    Object.values(validationUIConfig).forEach((config) => {
      expect(config?.renderMode).toBeDefined();
    });
  });

  it("inline_link configs define getHref", () => {
    Object.values(validationUIConfig).forEach((config) => {
      if (config?.renderMode === "inline_link") {
        expect(config.getHref).toBeDefined();
      }
    });
  });
});
