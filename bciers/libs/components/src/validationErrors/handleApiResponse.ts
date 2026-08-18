import { ValidationErrors } from "./types";

export function handleApiResponse<TKey extends string = string>(
  response: any,
  setErrors: (errors?: ValidationErrors<TKey>) => void,
  fallbackKey: TKey = "generic_error" as TKey,
): boolean {
  if (response?.validation?.errors?.length) {
    setErrors(response.validation.errors);
    return false;
  }
  if (response?.error) {
    setErrors([
      {
        key: fallbackKey,
        error: {
          severity: "Error",
          message:
            typeof response.error === "string"
              ? response.error
              : "An unexpected error occurred.",
        },
      },
    ]);
    return false;
  }
  setErrors(undefined);
  return true;
}
