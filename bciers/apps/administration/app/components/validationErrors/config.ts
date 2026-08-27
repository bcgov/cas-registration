import {
  createValidationUIConfig,
  ValidationUIConfig,
} from "@bciers/components/validationErrors";
import { ValidationMessageKey } from "./types";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";

export const validationUIConfig: Partial<
  Record<ValidationMessageKey, ValidationUIConfig<ValidationMessageKey>>
> = {
  no_bceid_access: createValidationUIConfig<ValidationMessageKey>({
    priority: 1,
    renderMode: "inline_link",
    label: "ghgregulator@gov.bc.ca",
    getHref: () =>
      ghgRegulatorEmail.startsWith("mailto:")
        ? ghgRegulatorEmail
        : `mailto:${ghgRegulatorEmail}`,
    formatMessage: ({ label }) =>
      `Your business BCeID does not have access to this operator. Please contact your operator's administrator to request the correct business BCeID. If this issue persists, please contact ${label}.`,
  }),

  operation_rep_required: createValidationUIConfig<ValidationMessageKey>({
    priority: 1,
    renderMode: "inline_link",
    label: "Contacts",
    getHref: () => "/contacts",
    formatMessage: ({ message, label }) =>
      message ??
      `The contact is missing address information. Please return to ${label} and fill in their address information before assigning them as an Operation Representative here.`,
  }),
};
