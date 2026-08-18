import { ValidationUIConfig } from "@bciers/components/validationErrors";
import { ValidationKey } from "./types";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";

export const validationUIConfig: Partial<
  Record<ValidationKey, ValidationUIConfig<ValidationKey>>
> = {
  no_bceid_access: {
    priority: 10,
    renderMode: "inline_link",
    resolveLabel: () => "ghgregulator@gov.bc.ca",
    resolveHref: () => ghgRegulatorEmail,
    resolveMessage: (error) =>
      error.message ??
      "Your business BCeID does not have access to this operator. Please contact ghgregulator@gov.bc.ca",
    resolveFormattedMessage: (error) =>
      error.message ??
      "Your business BCeID does not have access to this operator. Please contact ghgregulator@gov.bc.ca",
  },
  operation_rep_required: {
    priority: 10,
    renderMode: "inline_link",
    resolveLabel: () => "Contacts",
    resolveHref: () => "/contacts",
    resolveMessage: (error) =>
      error.message ?? "Please return to Contacts to assign a representative.",
    resolveFormattedMessage: (error) =>
      error.message ?? "Please return to Contacts to assign a representative.",
  },
};
