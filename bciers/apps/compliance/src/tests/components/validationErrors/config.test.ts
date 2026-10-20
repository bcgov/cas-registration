import { describe, it, expect } from "vitest";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";
import {
  sharedValidationUIConfig,
  ValidationItemError,
} from "@bciers/components/validationErrors";
import { sortAlphabetically } from "@bciers/testConfig/helpers/sort";
import { validationUIConfig } from "@/compliance/src/app/components/validationErrors/config";
import {
  localValidationKeys,
  type ValidationMessageKey,
} from "@/compliance/src/app/components/validationErrors/types";

describe("Compliance validationUIConfig", () => {
  const baseError: ValidationItemError = { severity: "Error" };

  describe("validationUIConfig key parity", () => {
    it("has a config for every shared and local validation key", () => {
      const sharedKeys = Object.keys(sharedValidationUIConfig);
      const expectedKeys = [...sharedKeys, ...localValidationKeys];

      expect(Object.keys(validationUIConfig).sort(sortAlphabetically)).toEqual(
        expectedKeys.sort(sortAlphabetically),
      );
    });
  });

  describe("BCCR account keys", () => {
    const cases: {
      key: ValidationMessageKey;
      priority: number;
      message: string;
    }[] = [
      {
        key: "invalid_bccr_account",
        priority: 10,
        message:
          "Please enter a valid BCCR Holding Account ID to move to the next step, or contact GHGRegulator@gov.bc.ca if you have any questions.",
      },
      {
        key: "wrong_bccr_account_type",
        priority: 20,
        message:
          "Please enter a BCCR Account ID with the account type 'Operator of Regulated Operation', or contact GHGRegulator@gov.bc.ca if you have any questions.",
      },
      {
        key: "bccr_error",
        priority: 30,
        message:
          "Remote BC Carbon Registry system issues, please try again later or contact GHGRegulator@gov.bc.ca if you have any questions.",
      },
    ];

    it.each(cases)(
      "configures $key correctly",
      ({ key, priority, message }) => {
        const config = validationUIConfig[key]!;

        expect(config.renderMode).toBe("inline_link");
        expect(config.priority).toBe(priority);
        expect(config.resolveLabel(baseError)).toBe("GHGRegulator@gov.bc.ca");
        expect(config.resolveHref(baseError)).toBe(ghgRegulatorEmail);
        expect(config.resolveFormattedMessage(baseError, key)).toBe(message);
      },
    );

    it.each(cases)(
      "uses the frontend message for $key even when the backend sends one",
      ({ key, message }) => {
        const config = validationUIConfig[key]!;

        expect(
          config.resolveFormattedMessage(
            { ...baseError, message: "Backend message" },
            key,
          ),
        ).toBe(message);
      },
    );
  });
});
