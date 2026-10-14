import { describe, it, expect } from "vitest";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";
import { sharedValidationUIConfig } from "@bciers/components/validationErrors";
import {
  BCCR_ERROR_MESSAGE,
  validationUIConfig,
} from "@/compliance/src/app/components/validationErrors/config";
import { sortAlphabetically } from "@bciers/testConfig/helpers/sort";
import { localValidationKeys } from "@/compliance/src/app/components/validationErrors/types";

describe("validationUIConfig", () => {
  describe("validationUIConfig key parity", () => {
    it("has a config for every shared and local validation key", () => {
      const sharedKeys = Object.keys(sharedValidationUIConfig);
      const expectedKeys = [...sharedKeys, ...localValidationKeys];

      expect(Object.keys(validationUIConfig).sort(sortAlphabetically)).toEqual(
        expectedKeys.sort(sortAlphabetically),
      );
    });
  });

  describe("specific key configurations", () => {
    it("configures invalid_bccr_account correctly", () => {
      const config = validationUIConfig.invalid_bccr_account;
      const error = { severity: "Error" as const };
      const expectedHref = ghgRegulatorEmail.startsWith("mailto:")
        ? ghgRegulatorEmail
        : `mailto:${ghgRegulatorEmail}`;

      expect(config?.renderMode).toBe("inline_link");
      expect(config?.resolveLabel(error)).toBe("GHGRegulator@gov.bc.ca");
      expect(config?.resolveHref(error)).toBe(expectedHref);
      expect(
        config?.resolveFormattedMessage(error, "invalid_bccr_account"),
      ).toBe(
        "Please enter a valid BCCR Holding Account ID to move to the next step, or contact GHGRegulator@gov.bc.ca if you have any questions.",
      );
    });

    it("configures wrong_bccr_account_type correctly", () => {
      const config = validationUIConfig.wrong_bccr_account_type;
      const error = { severity: "Error" as const };
      const expectedHref = ghgRegulatorEmail.startsWith("mailto:")
        ? ghgRegulatorEmail
        : `mailto:${ghgRegulatorEmail}`;

      expect(config?.renderMode).toBe("inline_link");
      expect(config?.resolveLabel(error)).toBe("GHGRegulator@gov.bc.ca");
      expect(config?.resolveHref(error)).toBe(expectedHref);
      expect(
        config?.resolveFormattedMessage(error, "wrong_bccr_account_type"),
      ).toBe(
        "Please enter a BCCR Account ID with the account type 'Operator of Regulated Operation', or contact GHGRegulator@gov.bc.ca if you have any questions.",
      );
    });

    it("configures bccr_error correctly", () => {
      const config = validationUIConfig.bccr_error;
      const error = { severity: "Error" as const };
      const expectedHref = ghgRegulatorEmail.startsWith("mailto:")
        ? ghgRegulatorEmail
        : `mailto:${ghgRegulatorEmail}`;

      expect(config?.renderMode).toBe("inline_link");
      expect(config?.resolveLabel(error)).toBe("GHGRegulator@gov.bc.ca");
      expect(config?.resolveHref(error)).toBe(expectedHref);
      expect(config?.resolveFormattedMessage(error, "bccr_error")).toBe(
        BCCR_ERROR_MESSAGE,
      );
    });

    it("prefers the backend message for bccr_error when provided", () => {
      const config = validationUIConfig.bccr_error;
      const message = `${BCCR_ERROR_MESSAGE} Reference ID: abc123`;

      expect(
        config?.resolveFormattedMessage(
          { severity: "Error", message },
          "bccr_error",
        ),
      ).toBe(message);
    });
  });
});
