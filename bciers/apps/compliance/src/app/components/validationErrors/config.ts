import {
  createValidationUIConfig,
  sharedValidationUIConfig,
  ValidationUIConfig,
} from "@bciers/components/validationErrors";
import { ValidationMessageKey } from "./types";
import {
  ghgRegulatorEmail,
  ghgRegulatorEmailLabel,
} from "@bciers/utils/src/urls";

export const validationUIConfig: Partial<
  Record<ValidationMessageKey, ValidationUIConfig<ValidationMessageKey>>
> = {
  ...sharedValidationUIConfig,

  invalid_bccr_account: createValidationUIConfig<ValidationMessageKey>({
    priority: 10,
    renderMode: "inline_link",
    label: ghgRegulatorEmailLabel,
    getHref: () => ghgRegulatorEmail,
    formatMessage: ({ label }) =>
      `Please enter a valid BCCR Holding Account ID to move to the next step, or contact ${label} if you have any questions.`,
  }),

  wrong_bccr_account_type: createValidationUIConfig<ValidationMessageKey>({
    priority: 20,
    renderMode: "inline_link",
    label: ghgRegulatorEmailLabel,
    getHref: () => ghgRegulatorEmail,
    formatMessage: ({ label }) =>
      `Please enter a BCCR Account ID with the account type 'Operator of Regulated Operation', or contact ${label} if you have any questions.`,
  }),

  bccr_error: createValidationUIConfig<ValidationMessageKey>({
    priority: 30,
    renderMode: "inline_link",
    label: ghgRegulatorEmailLabel,
    getHref: () => ghgRegulatorEmail,
    formatMessage: ({ label }) =>
      `Remote BC Carbon Registry system issues, please try again later or contact ${label} if you have any questions.`,
  }),
};
