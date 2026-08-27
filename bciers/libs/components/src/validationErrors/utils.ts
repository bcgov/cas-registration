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

export const setClientError = <TKey extends string = string>(
  error: unknown,
  setErrors: (errors: ValidationItem<TKey>[] | undefined) => void,
  severity: ValidationSeverity = "Error",
) => {
  const message =
    typeof error === "string"
      ? error
      : (error as any)?.error ||
        (error as any)?.message ||
        "An unexpected error occurred.";

  setErrors([createGenericValidationError<TKey>(message, severity)]);
  return false;
};
