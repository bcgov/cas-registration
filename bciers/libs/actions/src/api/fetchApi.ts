import * as Sentry from "@sentry/nextjs";
/**
 * 🛠 Generic helper to fetch data from an API endpoint.
 *
 * @param endpoint - The API endpoint to fetch from.
 * @param token - Optional user token for authorization.
 * @param method - HTTP method (e.g., 'GET', 'POST', etc.). Default is 'GET'.
 * @param body - Optional request body for POST/PUT requests.
 * @param headers - Additional headers, defaults to Authorization header if token is provided.
 * @param cache - Cache policy (e.g., 'no-store'). Default is 'no-store'.
 * @returns The parsed JSON data from the response.
 */
export const fetchApi = async (
  endpoint: string,
  token?: { user_guid: string },
  method: string = "GET",
  body?: any,
  headers: HeadersInit = {},
  cache: RequestCache = "no-store",
) => {
  const baseApiUrl = `${process.env.API_URL}`;

  const defaultHeaders: HeadersInit = {
    ...(token && {
      Authorization: JSON.stringify({ user_guid: token.user_guid }),
    }),
    "Content-Type": "application/json",
    ...headers,
  };

  const options: RequestInit = {
    method,
    headers: defaultHeaders,
    cache,
    ...(body && { body: JSON.stringify(body) }), // Add body only if it's provided
  };

  const response = await fetch(`${baseApiUrl}${endpoint}`, options);

  if (!response.ok) {
    Sentry.captureException(
      `❗ Failed to fetchAPI ${endpoint}: ${response.statusText}`,
    );
  }

  return response.json();
};
