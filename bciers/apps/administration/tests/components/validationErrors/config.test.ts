import { describe, it, expect } from "vitest";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";
import type { ValidationMessageKey } from "@/administration/app/components/validationErrors/types";
import { validationUIConfig } from "@/administration/app/components/validationErrors/config";
import { sortAlphabetically } from "@bciers/testConfig/helpers/sort";

describe("validationUIConfig", () => {
  const expectedKeys: ValidationMessageKey[] = [
    "no_bceid_access",
    "operation_rep_required",
  ];

  it("has the expected number of configs", () => {
    expect(Object.keys(validationUIConfig)).toHaveLength(2);
  });

  it("has a config for every validation key", () => {
    expect(Object.keys(validationUIConfig).sort(sortAlphabetically)).toEqual(
      [...expectedKeys].sort(sortAlphabetically),
    );
  });

  describe("specific key configurations", () => {
    it("configures no_bceid_access correctly", () => {
      const config = validationUIConfig.no_bceid_access;
      const error = { severity: "Error" as const };
      const expectedHref = ghgRegulatorEmail.startsWith("mailto:")
        ? ghgRegulatorEmail
        : `mailto:${ghgRegulatorEmail}`;

      expect(config?.renderMode).toBe("inline_link");
      expect(config?.resolveLabel(error)).toBe("ghgregulator@gov.bc.ca");
      expect(config?.resolveHref(error)).toBe(expectedHref);
      expect(config?.resolveFormattedMessage(error, "no_bceid_access")).toBe(
        "Your business BCeID does not have access to this operator. Please contact your operator's administrator to request the correct business BCeID. If this issue persists, please contact ghgregulator@gov.bc.ca.",
      );
    });

    it("configures operation_rep_required correctly", () => {
      const config = validationUIConfig.operation_rep_required;
      const testMessage =
        "The contact Jane Doe is missing address information. Please return to Contacts and fill in their address information before assigning them as an Operation Representative here.";

      const errorWithMsg = {
        severity: "Error" as const,
        message: testMessage,
      };
      expect(config?.renderMode).toBe("inline_link");
      expect(config?.resolveLabel(errorWithMsg)).toBe("Contacts");
      expect(config?.resolveHref(errorWithMsg)).toBe("/contacts");

      expect(
        config?.resolveFormattedMessage(errorWithMsg, "operation_rep_required"),
      ).toBe(testMessage);
    });
  });
});
