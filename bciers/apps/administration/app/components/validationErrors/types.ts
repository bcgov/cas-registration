import { ValidationMessageKey as SharedKey } from "@bciers/components/validationErrors";

/**
 * Application-specific validation message keys
 */
export const localValidationKeys = [
  "no_bceid_access",
  "operation_rep_required",
] as const;

export type ValidationMessageKey = SharedKey<
  (typeof localValidationKeys)[number]
>;
