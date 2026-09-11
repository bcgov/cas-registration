export const USER_ERROR_KEY = "user_error";

// Kept separate from isUserError: this list is about Sentry noise
export const NON_REPORTABLE_ERROR_KEYS: readonly string[] = [USER_ERROR_KEY];

const hasOnlyErrorKeys = (res: any, keys: readonly string[]): boolean =>
  Array.isArray(res?.errors) &&
  res.errors.length > 0 &&
  res.errors.every((e: any) => keys.includes(e?.key));

export function isUserError(res: any): boolean {
  return hasOnlyErrorKeys(res, [USER_ERROR_KEY]);
}

export default function isNonReportableError(res: any): boolean {
  return hasOnlyErrorKeys(res, NON_REPORTABLE_ERROR_KEYS);
}
