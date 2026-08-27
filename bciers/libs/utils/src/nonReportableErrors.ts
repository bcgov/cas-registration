export const NON_REPORTABLE_ERROR_KEYS: readonly string[] = ["user_error"];

export default function isNonReportableError(res: any): boolean {
  return (
    Array.isArray(res?.errors) &&
    res.errors.length > 0 &&
    res.errors.every((e: any) => NON_REPORTABLE_ERROR_KEYS.includes(e?.key))
  );
}
