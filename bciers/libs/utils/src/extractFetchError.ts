export const extractFetchError = (
  e: unknown,
  fallback = "Failed to load data.",
): string => (e instanceof Error ? e.message : fallback);
