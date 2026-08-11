import { getToken } from "@bciers/actions";
import { captureException } from "@bciers/sentryConfig/sentry";

/**
 * Safely captures exceptions without letting Sentry reporting errors crash the app.
 */
function logSentryError(error: Error | string | unknown, userGuid?: string) {
  try {
    const errObj =
      error instanceof Error
        ? error
        : new Error(
            typeof error === "string"
              ? error
              : (JSON.stringify(error) ?? "Unknown error"),
          );
    captureException(errObj, userGuid);
  } catch (sentryErr) {
    // eslint-disable-next-line no-console
    console.error("Failed to report exception to Sentry:", sentryErr);
  }
}

/**
 * Safely parses response JSON, returning null if invalid/empty.
 */
async function parseResponseBody(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Safely fetches data from an API endpoint using getToken,
 * returning a fallback value if any HTTP or API error occurs.
 */
export async function safeFetchApi<T>(
  endpoint: string,
  fallback: T,
  method: string = "GET",
  body?: unknown,
  headers: HeadersInit = {},
  cache: RequestCache = "no-store",
): Promise<T> {
  let userGuid: string | undefined;

  try {
    const token = await getToken();
    userGuid = token?.user_guid;

    const baseApiUrl = process.env.API_URL;
    const defaultHeaders: HeadersInit = {
      ...(token
        ? { Authorization: JSON.stringify({ user_guid: token.user_guid }) }
        : {}),
      "Content-Type": "application/json",
      ...headers,
    };

    const options: RequestInit = {
      method,
      headers: defaultHeaders,
      cache,
      ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const response = await fetch(`${baseApiUrl}${endpoint}`, options);

    if (!response.ok) {
      logSentryError(
        `❗ Failed HTTP fetch ${endpoint}: ${response.statusText}`,
        userGuid,
      );
      return fallback;
    }

    const res = await parseResponseBody(response);
    const apiError = res?.error || res?.message;

    if (!res || apiError) {
      if (apiError) {
        logSentryError(`[API Error] ${endpoint}: ${apiError}`, userGuid);
      }
      return fallback;
    }

    return res as T;
  } catch (error: unknown) {
    logSentryError(error, userGuid);
    return fallback;
  }
}
