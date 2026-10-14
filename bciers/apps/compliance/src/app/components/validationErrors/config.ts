import {
  createValidationUIConfig,
  sharedValidationUIConfig,
  ValidationUIConfig,
} from "@bciers/components/validationErrors";
import { ValidationMessageKey } from "./types";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";

export const BCCR_ERROR_MESSAGE =
  "The system cannot connect to the external application. Please try again later. If the problem persists, contact GHGRegulator@gov.bc.ca for help.";

export const validationUIConfig: Partial<
  Record<ValidationMessageKey, ValidationUIConfig<ValidationMessageKey>>
> = {
  ...sharedValidationUIConfig,

  invalid_bccr_account: createValidationUIConfig<ValidationMessageKey>({
    priority: 10,
    renderMode: "inline_link",
    label: "GHGRegulator@gov.bc.ca",
    getHref: () => ghgRegulatorEmail,
    formatMessage: ({ label }) =>
      `Please enter a valid BCCR Holding Account ID to move to the next step, or contact ${label} if you have any questions.`,
  }),

  wrong_bccr_account_type: createValidationUIConfig<ValidationMessageKey>({
    priority: 20,
    renderMode: "inline_link",
    label: "GHGRegulator@gov.bc.ca",
    getHref: () => ghgRegulatorEmail,
    formatMessage: ({ label }) =>
      `Please enter a BCCR Account ID with the account type 'Operator of Regulated Operation', or contact ${label} if you have any questions.`,
  }),

  // Mirrors the backend ExceptionHandler `bccr_error` key; the backend message
  // (which may include a Sentry reference ID) takes precedence when present
  bccr_error: createValidationUIConfig<ValidationMessageKey>({
    priority: 30,
    renderMode: "inline_link",
    label: "GHGRegulator@gov.bc.ca",
    getHref: () => ghgRegulatorEmail,
    getMessage: (error) => error.message ?? BCCR_ERROR_MESSAGE,
  }),
};
