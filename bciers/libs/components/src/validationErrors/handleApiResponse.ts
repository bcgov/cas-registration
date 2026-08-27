import { ValidationErrors, ValidationItem } from "./types";

const GENERIC_KEYS = new Set(["generic_error", "error", "default"]);

export function handleApiResponse<TKey extends string = string>(
  response: any,
  setErrors: (errors?: ValidationErrors<TKey>) => void,
  fallbackKey: TKey = "generic_error" as TKey,
): boolean {
  if (response?.validation?.errors?.length) {
    const hasCustomFallback = fallbackKey !== ("generic_error" as TKey);
    const resolvedErrors: ValidationErrors<TKey> =
      response.validation.errors.map((item: ValidationItem<TKey>) => {
        const shouldUseFallbackKey =
          !item.key ||
          GENERIC_KEYS.has(item.key as string) ||
          (item.key === "user_error" && hasCustomFallback);
        return {
          ...item,
          key: shouldUseFallbackKey ? fallbackKey : item.key,
        };
      });

    setErrors(resolvedErrors);
    return false;
  }

  if (response?.error || response?.message) {
    let message = "An unexpected error occurred.";

    if (typeof response.error === "string") {
      message = response.error;
    } else if (typeof response.message === "string") {
      message = response.message;
    }

    setErrors([
      {
        key: fallbackKey,
        error: {
          severity: "Error",
          message,
        },
      },
    ]);

    return false;
  }

  setErrors(undefined);
  return true;
}
