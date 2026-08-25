import { ghgRegulatorEmail } from "@bciers/utils/src/urls";
import type { ValidationKey } from "@/administration/app/components/validationErrors/types";
import { validationUIConfig } from "@/administration/app/components/validationErrors/config";

const sortAlphabetically = (a: string, b: string) => a.localeCompare(b);

describe("validationUIConfig", () => {
  const expectedKeys: ValidationKey[] = [
    "no_bceid_access",
    "operation_rep_required",
    "operator_not_found",
  ];

  it("has the expected number of configs", () => {
    expect(Object.keys(validationUIConfig)).toHaveLength(expectedKeys.length);
  });

  it("has a config for every validation key", () => {
    expect(Object.keys(validationUIConfig).sort(sortAlphabetically)).toEqual(
      [...expectedKeys].sort(sortAlphabetically),
    );
  });

  it("all configs define a renderMode and priority", () => {
    Object.values(validationUIConfig).forEach((config) => {
      expect(config?.renderMode).toBeDefined();
      expect(config?.priority).toBeDefined();
    });
  });

  it("inline_link configs resolve a valid href and label", () => {
    Object.values(validationUIConfig).forEach((config) => {
      if (config?.renderMode === "inline_link") {
        expect(config.resolveHref({ severity: "Error" })).toBeDefined();
        expect(config.resolveLabel({ severity: "Error" })).toBeDefined();
      }
    });
  });

  describe("specific key configurations", () => {
    it("configures no_bceid_access correctly", () => {
      const config = validationUIConfig.no_bceid_access;
      const error = { severity: "Error" as const };

      expect(config?.renderMode).toBe("inline_link");
      expect(config?.resolveLabel(error)).toBe("ghgregulator@gov.bc.ca");
      expect(config?.resolveHref(error)).toBe(ghgRegulatorEmail);
      expect(config?.resolveMessage(error, "no_bceid_access")).toBe(
        "Your business BCeID does not have access to this operator. Please contact ghgregulator@gov.bc.ca",
      );
    });

    it("configures operation_rep_required correctly", () => {
      const config = validationUIConfig.operation_rep_required;
      const error = { severity: "Error" as const };

      expect(config?.renderMode).toBe("inline_link");
      expect(config?.resolveLabel(error)).toBe("Contacts");
      expect(config?.resolveHref(error)).toBe("/contacts");
      expect(config?.resolveMessage(error, "operation_rep_required")).toBe(
        "Please return to Contacts to assign a representative.",
      );
    });

    it("configures operator_not_found correctly", () => {
      const config = validationUIConfig.operator_not_found;
      const error = { severity: "Error" as const };

      expect(config?.renderMode).toBe("inline_link");
      expect(config?.resolveLabel(error)).toBe("Add Operator");
      expect(config?.resolveHref(error)).toBe("/select-operator/add-operator");
      expect(config?.resolveFormattedMessage(error, "operator_not_found")).toBe(
        "No operator found matching the provided criteria. You can Add Operator instead.",
      );
    });

    it("uses custom error messages when provided in the error object", () => {
      const customMessage = "Custom override message";
      const errorWithCustomMsg = {
        severity: "Error" as const,
        message: customMessage,
      };

      Object.entries(validationUIConfig).forEach(([key, config]) => {
        expect(
          config?.resolveMessage(errorWithCustomMsg, key as ValidationKey),
        ).toBe(customMessage);
      });
    });
  });
});
