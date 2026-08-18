import type { ValidationItem, ValidationSeverity } from "./types";

export const createGenericValidationError = <TKey extends string = string>(
  message: string,
  severity: ValidationSeverity = "Error",
): ValidationItem<TKey> => ({
  key: "generic_error" as TKey,
  error: {
    message,
    severity,
  },
});
