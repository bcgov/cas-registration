import { ValidationMessageKey as SharedKey } from "@bciers/components/validationErrors";

/**
 * Application-specific validation message keys
 */
export const localValidationKeys = [
  "invalid_bccr_account",
  "bccr_error",
] as const;

export type ValidationMessageKey = SharedKey<
  (typeof localValidationKeys)[number]
>;
