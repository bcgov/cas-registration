import { describe, it, expect, vi } from "vitest";
import { validationUIConfig } from "@reporting/src/app/components/validationErrors/config";
import type { ValidationMessageKey } from "@reporting/src/app/components/validationErrors/types";
import {
  facilityRoutes,
  reportRoutes,
  resolveValidationHref,
} from "@reporting/src/app/utils/routes";
import { ValidationItemError } from "@bciers/components/validationErrors";
import { sortAlphabetically } from "@bciers/testConfig/helpers/sort";

// Mocks
vi.mock("@reporting/src/app/utils/routes", () => ({
  facilityRoutes: {
    activity: vi.fn(
      (ver, fac, act) => `/reports/${ver}/facilities/${fac}/activities/${act}`,
    ),
    allocationOfEmissions: vi.fn(
      (ver, fac) => `/reports/${ver}/facilities/${fac}/allocation`,
    ),
  },
  reportRoutes: {
    reviewOperationInformation: vi.fn(
      (ver) => `/reports/${ver}/review-operation-information`,
    ),
    verification: vi.fn((ver) => `/reports/${ver}/verification`),
    attachments: vi.fn((ver) => `/reports/${ver}/attachments`),
    reviewChanges: vi.fn((ver) => `/reports/${ver}/review-changes`),
  },
  resolveValidationHref: vi.fn(
    (ctx) => `/resolved-href/${ctx?.section ?? "default"}`,
  ),
}));

describe("Reporting validationUIConfig", () => {
  const baseError: ValidationItemError = {
    severity: "Error",
  };

  describe("validationUIConfig key parity", () => {
    const expectedKeys: ValidationMessageKey[] = [
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
      "generic_error",
    ];

    it("has the expected number of configs", () => {
      expect(Object.keys(validationUIConfig)).toHaveLength(expectedKeys.length);
    });

    it("has a config for every expected validation key", () => {
      expect(Object.keys(validationUIConfig).sort(sortAlphabetically)).toEqual(
        [...expectedKeys].sort(sortAlphabetically),
      );
    });
  });

  describe("error_required_fields", () => {
    const config = validationUIConfig.error_required_fields!;

    it("resolves label from context or fallback", () => {
      expect(config.resolveLabel(baseError)).toBe("review section");
      expect(
        config.resolveLabel({
          ...baseError,
          context: { section_title: "Fuel Supply" },
        }),
      ).toBe("Fuel Supply");
    });

    it("uses resolveValidationHref for href resolution", () => {
      const errorWithContext: ValidationItemError = {
        ...baseError,
        context: { section: "facility-overview" },
      };
      const href = config.resolveHref(errorWithContext);

      expect(resolveValidationHref).toHaveBeenCalledWith({
        section: "facility-overview",
      });
      expect(href).toBe("/resolved-href/facility-overview");
    });

    it("formats message with missing fields and facility name", () => {
      const error: ValidationItemError = {
        ...baseError,
        context: {
          section_title: "Emission Totals",
          facility_name: "Facility Alpha",
          missing_fields: ["CO2", "CH4"],
        },
      };

      expect(config.resolveMessage(error, "error_required_fields")).toBe(
        "Required fields are empty on Emission Totals for Facility Alpha: CO2, CH4.",
      );
    });

    it("formats message without missing fields or facility name", () => {
      expect(config.resolveMessage(baseError, "error_required_fields")).toBe(
        "Required fields are empty on this section.",
      );
    });
  });

  describe("operation_boro_id and missing_regulated_product", () => {
    const keys: ValidationMessageKey[] = [
      "operation_boro_id",
      "missing_regulated_product",
    ];

    keys.forEach((key) => {
      it(`configures ${key} correctly`, () => {
        const config = validationUIConfig[key]!;
        expect(config.renderMode).toBe("inline_link");
        expect(config.priority).toBe(2);
        expect(config.resolveLabel(baseError)).toBe(
          "Review Operation Information",
        );

        const href = config.resolveHref({
          ...baseError,
          context: { report_version_id: 10 },
        });
        expect(reportRoutes.reviewOperationInformation).toHaveBeenCalledWith(
          10,
        );
        expect(href).toBe("/reports/10/review-operation-information");
      });
    });
  });

  describe("report_activity_json_validation", () => {
    const config = validationUIConfig.report_activity_json_validation!;

    it("resolves label, href, and formatted message with fallback context", () => {
      expect(config.renderMode).toBe("inline_link");
      expect(config.priority).toBe(3);
      expect(config.resolveLabel(baseError)).toBe("Activity data");

      const formatted = config.resolveFormattedMessage(
        baseError,
        "report_activity_json_validation",
      );
      expect(formatted).toBe(
        "JSON schema validation failure detected for facility activity. Please forward this error message to ghgregulator@gov.bc.ca to resolve this issue.",
      );
    });

    it("resolves href and formatted message with populated context", () => {
      const error: ValidationItemError = {
        ...baseError,
        context: {
          report_version_id: 5,
          facility_id: "fac-1",
          activity_id: "act-2",
          facility_name: "Plant A",
          activity_name: "Combustion",
        },
      };

      expect(config.resolveLabel(error)).toBe("Combustion");
      expect(config.resolveHref(error)).toBe(
        "/reports/5/facilities/fac-1/activities/act-2",
      );
      expect(
        config.resolveFormattedMessage(
          error,
          "report_activity_json_validation",
        ),
      ).toBe(
        "JSON schema validation failure detected for Plant A Combustion. Please forward this error message to ghgregulator@gov.bc.ca to resolve this issue.",
      );
    });
  });

  describe("report_data_out_of_bounds_by_fuel_type", () => {
    const config = validationUIConfig.report_data_out_of_bounds_by_fuel_type!;

    it("resolves formatted message with error context details", () => {
      const error: ValidationItemError = {
        ...baseError,
        context: {
          report_version_id: 1,
          facility_id: "fac-1",
          activity_id: "act-1",
          facility_name: "Facility 1",
          activity_name: "Fuel Activity",
          fuel_type_name: "Natural Gas",
          reporting_field: "Amount",
          expected_range: "0-100",
          user_input: "500",
        },
      };

      const result = config.resolveFormattedMessage(
        error,
        "report_data_out_of_bounds_by_fuel_type",
      );

      expect(result).toContain(
        "Unusual value detected for Facility 1 Fuel Activity.",
      );
      expect(result).toContain(
        "Expected Natural Gas Amount value to be between 0-100 but input was 500.",
      );
      expect(result).toContain(
        "If the value is accurate, you may save & continue.",
      );
    });
  });

  describe("report_data_out_of_bounds_by_reporting_field", () => {
    const config =
      validationUIConfig.report_data_out_of_bounds_by_reporting_field!;

    it("resolves formatted message with gas context details", () => {
      const error: ValidationItemError = {
        ...baseError,
        context: {
          report_version_id: 1,
          facility_id: "fac-1",
          activity_id: "act-1",
          facility_name: "Facility 1",
          activity_name: "Flaring",
          gas_type_name: "Methane",
          reporting_field: "Emissions",
          expected_range: "10-20",
          user_input: "99",
        },
      };

      const result = config.resolveFormattedMessage(
        error,
        "report_data_out_of_bounds_by_reporting_field",
      );

      expect(result).toContain(
        "Unusual value detected for Facility 1 Flaring.",
      );
      expect(result).toContain(
        "Expected Methane Emissions value to be between 10-20 but input was 99.",
      );
    });
  });

  describe("allocation routes", () => {
    it("resolves allocation_mismatch href and label", () => {
      const config = validationUIConfig.allocation_mismatch!;
      expect(config.resolveLabel(baseError)).toBe(
        "Allocation of Emissions page",
      );

      const href = config.resolveHref({
        ...baseError,
        context: { report_version_id: 8, facility_id: "fac-8" },
      });
      expect(facilityRoutes.allocationOfEmissions).toHaveBeenCalledWith(
        8,
        "fac-8",
      );
      expect(href).toBe("/reports/8/facilities/fac-8/allocation");
    });

    it("resolves og_np_nc_allocation_mismatch formatted message and href", () => {
      const config = validationUIConfig.og_np_nc_allocation_mismatch!;
      const error: ValidationItemError = {
        ...baseError,
        context: {
          report_version_id: 8,
          facility_id: "fac-8",
          facility_name: "Compressor Station",
        },
      };

      expect(
        config.resolveFormattedMessage(error, "og_np_nc_allocation_mismatch"),
      ).toBe(
        "Facility Compressor Station: Please review the allocation of emissions and ensure that only excluded emissions are allocated to unregulated products. If they are allocated, you may save and continue.",
      );
    });
  });

  describe("attachments and verification routes", () => {
    it("resolves missing_report_verification href", () => {
      const config = validationUIConfig.missing_report_verification!;
      expect(config.resolveLabel(baseError)).toBe("Verification page");

      const href = config.resolveHref({
        ...baseError,
        context: { report_version_id: 15 },
      });
      expect(reportRoutes.verification).toHaveBeenCalledWith(15);
      expect(href).toBe("/reports/15/verification");
    });

    it("resolves verification_statement href and label", () => {
      const config = validationUIConfig.verification_statement!;
      expect(config.resolveLabel(baseError)).toBe("Attachments page");

      const href = config.resolveHref({
        ...baseError,
        context: { report_version_id: 12 },
      });
      expect(reportRoutes.attachments).toHaveBeenCalledWith(12);
      expect(href).toBe("/reports/12/attachments");
    });

    it("configures attachment_not_scanned as message_only", () => {
      const config = validationUIConfig.attachment_not_scanned!;
      expect(config.renderMode).toBe("message_only");
    });

    it("resolves missing_supplementary_report_version_change href", () => {
      const config =
        validationUIConfig.missing_supplementary_report_version_change!;
      expect(config.resolveLabel(baseError)).toBe("Review Changes page");

      const href = config.resolveHref({
        ...baseError,
        context: { report_version_id: 3 },
      });
      expect(reportRoutes.reviewChanges).toHaveBeenCalledWith(3);
      expect(href).toBe("/reports/3/review-changes");
    });
  });

  describe("missing_operation_representative", () => {
    const config = validationUIConfig.missing_operation_representative!;

    it("configures target route with encoded query param and openInNewTab", () => {
      expect(config.renderMode).toBe("inline_link");
      expect(config.openInNewTab).toBe(true);
      expect(config.resolveLabel(baseError)).toBe(
        "add an operation representative for this operation",
      );

      const error: ValidationItemError = {
        ...baseError,
        context: {
          operation_id: "op-123",
          operation_name: "Clean Energy & Power Inc.",
        },
      };

      expect(config.resolveHref(error)).toBe(
        "/administration/operations/op-123?operations_title=Clean%20Energy%20%26%20Power%20Inc.",
      );
    });

    it("returns static message from getMessage", () => {
      expect(
        config.resolveMessage(baseError, "missing_operation_representative"),
      ).toBe(
        "Before you can continue, you must add an operation representative for this operation then return to this report.",
      );
    });
  });

  describe("generic_error", () => {
    const config = validationUIConfig.generic_error!;

    it("renders custom message if provided", () => {
      const error: ValidationItemError = {
        ...baseError,
        message: "Custom downstream failure",
      };
      expect(config.resolveMessage(error, "generic_error")).toBe(
        "Custom downstream failure",
      );
    });

    it("falls back to generic error message when message is absent", () => {
      expect(config.resolveMessage(baseError, "generic_error")).toBe(
        "An internal server error has occurred. Please contact ghgregulator@gov.bc.ca for help.",
      );
    });
  });
});
