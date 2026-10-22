import {
  createValidationUIConfig,
  sharedValidationUIConfig,
  ValidationLinks,
  ValidationUIConfig,
} from "@bciers/components/validationErrors";
import { ValidationMessageKey } from "./types";
import {
  ghgRegulatorEmail,
  ghgRegulatorEmailAddress,
} from "@bciers/utils/src/urls";

// Text in a message (e.g. a backend user_error) that is rendered as a link
export const validationLinks: ValidationLinks = {
  [ghgRegulatorEmailAddress]: ghgRegulatorEmail,
};

export const validationUIConfig: Partial<
  Record<ValidationMessageKey, ValidationUIConfig<ValidationMessageKey>>
> = {
  ...sharedValidationUIConfig,

  invalid_bccr_account: createValidationUIConfig<ValidationMessageKey>({
    priority: 1,
    renderMode: "inline_link",
    label: ghgRegulatorEmailAddress,
    getHref: () => ghgRegulatorEmail,
    formatMessage: ({ label }) =>
      `Please enter a valid BCCR Holding Account ID to move to the next step, or contact ${label} if you have any questions.`,
  }),

  // Matches the backend key for BCCarbonRegistryError responses
  bccr_error: createValidationUIConfig<ValidationMessageKey>({
    priority: 1,
    renderMode: "inline_link",
    label: ghgRegulatorEmailAddress,
    getHref: () => ghgRegulatorEmail,
    formatMessage: ({ label }) =>
      `Remote BC Carbon Registry system issues, please try again later or contact ${label} if you have any questions.`,
  }),
};
