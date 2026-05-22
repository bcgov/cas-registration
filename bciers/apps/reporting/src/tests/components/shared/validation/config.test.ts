import { validationUIConfig } from "@reporting/src/app/components/shared/validation/config";
import { resolveValidationHref } from "@reporting/src/app/utils/routes";
import type { ReportValidationMessageKey } from "@reporting/src/app/components/shared/validation/types";

const sortAlphabetically = (a: string, b: string) => a.localeCompare(b);

describe("validationUIConfig", () => {
  const expectedKeys: ReportValidationMessageKey[] = [
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
    "generic_error",
  ];

  it("has the expected number of configs", () => {
    expect(Object.keys(validationUIConfig)).toHaveLength(16);
  });

  it("has a config for every validation key", () => {
    expect(Object.keys(validationUIConfig).sort(sortAlphabetically)).toEqual(
      [...expectedKeys].sort(sortAlphabetically),
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

  it("error_required_fields uses resolveValidationHref", () => {
    const config = validationUIConfig.error_required_fields;

    expect(config?.getHref).toBe(resolveValidationHref);
  });

  it("inline_link getHref returns a valid route when given valid context", () => {
    const mockCtx = {
      report_version_id: 123,
      facility_id: "facility-1",
      activity_id: 999,
      section: "activity_data",
    };

    Object.values(validationUIConfig).forEach((config) => {
      if (config?.renderMode === "inline_link" && config.getHref) {
        const href = config.getHref(mockCtx as any);

        if (href !== undefined) {
          expect(href).toContain("/reports/123");
        }
      }
    });
  });

  it("exposes a og_np_nc_allocation_mismatch config", () => {
    const config = validationUIConfig.og_np_nc_allocation_mismatch;
    expect(config?.renderMode).toBe("inline_link");
    expect(config?.label).toBe("allocation of emissions");
    expect(
      config?.getHref &&
        config.getHref({
          report_version_id: 123,
          facility_id: "facility-1",
        }),
    ).toBe("/reports/123/facilities/facility-1/allocation-of-emissions");
    expect(
      config?.formatMessage &&
        config?.formatMessage({
          label: "test label",
          error: { context: { facility_name: "facility abc" } },
        } as any),
    )
      .toBe(`Facility facility abc: Please review the test label and ensure that only excluded emissions are
        allocated to unregulated products. If they are allocated, you may save and continue.`);
  });
});
