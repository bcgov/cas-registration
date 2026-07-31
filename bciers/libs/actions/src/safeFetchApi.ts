import { getToken } from "@bciers/actions";
import { fetchApi } from "@bciers/actions/api/fetchApi";
import { captureException } from "@bciers/sentryConfig/sentry";

/**
 * Safely fetches data using fetchApi and getToken,
 * returning a fallback value if any error occurs
 */
export async function safeFetchApi<T>(
  endpoint: string,
  fallback: T,
  method: string = "GET",
  body?: unknown,
): Promise<T> {
  let userGuid: string | undefined;

  try {
    const token = await getToken();
    userGuid = token?.user_guid;

    const response = await fetchApi(endpoint, token, method, body);
    const apiError = response?.error || response?.message;

    if (!response || apiError) {
      if (apiError) {
        try {
          captureException(
            new Error(`[API Error] ${endpoint}: ${apiError}`),
            userGuid,
          );
        } catch (sentryErr) {
          // eslint-disable-next-line no-console
          console.error("Failed to report exception to Sentry:", sentryErr);
        }
      }
      return fallback;
    }

    return response as T;
  } catch (error: unknown) {
    try {
      const errObj = error instanceof Error ? error : null;
      const message =
        typeof error === "string"
          ? error
          : (JSON.stringify(error) ?? "Unknown error");

      captureException(errObj || new Error(message), userGuid);
    } catch (sentryErr) {
      // eslint-disable-next-line no-console
      console.error("Failed to report exception to Sentry:", sentryErr);
    }

    return fallback;
  }
}
