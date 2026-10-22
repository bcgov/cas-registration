import { describe, it, expect } from "vitest";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";
import {
  sharedValidationUIConfig,
  ValidationItemError,
} from "@bciers/components/validationErrors";
import { sortAlphabetically } from "@bciers/testConfig/helpers/sort";
import {
  validationLinks,
  validationUIConfig,
} from "@/compliance/src/app/components/validationErrors/config";
import {
  localValidationKeys,
  type ValidationMessageKey,
} from "@/compliance/src/app/components/validationErrors/types";

describe("Compliance validationUIConfig", () => {
  const baseError: ValidationItemError = { severity: "Error" };

  it("has a config for every shared and local validation key", () => {
    const expectedKeys = [
      ...Object.keys(sharedValidationUIConfig),
      ...localValidationKeys,
    ];

    expect(Object.keys(validationUIConfig).sort(sortAlphabetically)).toEqual(
      expectedKeys.sort(sortAlphabetically),
    );
  });

  const cases: { key: ValidationMessageKey; message: string }[] = [
    {
      key: "invalid_bccr_account",
      message:
        "Please enter a valid BCCR Holding Account ID to move to the next step, or contact GHGRegulator@gov.bc.ca if you have any questions.",
    },
    {
      key: "bccr_error",
      message:
        "Remote BC Carbon Registry system issues, please try again later or contact GHGRegulator@gov.bc.ca if you have any questions.",
    },
  ];

  it.each(cases)("configures $key", ({ key, message }) => {
    const config = validationUIConfig[key]!;

    expect(config.renderMode).toBe("inline_link");
    expect(config.resolveLabel(baseError)).toBe("GHGRegulator@gov.bc.ca");
    expect(config.resolveHref(baseError)).toBe(ghgRegulatorEmail);
    expect(
      config.resolveFormattedMessage(
        { ...baseError, message: "Backend message" },
        key,
      ),
    ).toBe(message);
  });

  it("links the GHGRegulator email in messages", () => {
    expect(validationLinks).toEqual({
      "GHGRegulator@gov.bc.ca": ghgRegulatorEmail,
    });
  });
});
