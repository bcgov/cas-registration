/**
📚 Server Actions:
 Server actions are JavaScript async functions that run on the server
and can be called from server components or from client components.

💡 You can define Server actins in RSC or define multiple Server Actions in a single file.
*/
"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { mockToken } from "mock/mocksession"
// 🛠️ Function to get the encrypted JWT from NextAuth getToken route function
export async function getToken() {
  try {
    if (process.env.BYPASS) return mockToken
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/token`, {
      method: "GET",
      headers: { Cookie: cookies().toString() },
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error(`Failed to fetch token. Status: ${res.status}`);
      return {};
    }
    return await res.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`An error occurred while fetching token: ${error}`);
    return {};
  }
}

// 🛠️ Function to get the last non-empty segment as a UUID from an endpoint URL
function getUUIDFromEndpoint(endpoint: string): string | null {
  // Split the endpoint URL by '/'
  const segments = endpoint.split("/");

  // Filter out empty segments
  const nonEmptySegments = segments.filter((segment) => segment.trim() !== "");

  // Find the last non-empty segment
  const lastSegment: string | null =
    nonEmptySegments.length > 0
      ? nonEmptySegments[nonEmptySegments.length - 1]
      : null;

  // Validate if the last segment is a UUID (a more permissive pattern)
  const isUUID = /^[0-9a-fA-F]{32}$/.test(lastSegment as string);

  // Return the last non-empty segment as a UUID or null if not a UUID
  return isUUID ? (lastSegment as string) : null;
}

/**
 * Generic action handler that sends a request to the specified API endpoint
 * and returns the response as a JSON object.
 * @param apiUrl The relative URL of the API endpoint to send the request to.
 * @param method The HTTP method to use for the request (GET, POST, PUT, DELETE, PATCH).
 * @param pathToRevalidate The path of the data to revalidate after the request is complete.
 * @param options Optional data to include in the request body (example: body for POST, PUT, and PATCH requests, overriding cache control).
 * @returns A Promise that resolves to the JSON response from the API endpoint, or an error object if the request fails.
 */
export async function actionHandler(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  pathToRevalidate?: string,
  options: RequestInit = {},
) {
  // Create a FormData object from the body if it's a string to pass to Sentry
  const formData = new FormData();
  if (options?.body && typeof options.body === "string")
    for (const [key, value] of Object.entries(JSON.parse(options.body)))
      formData.append(key, value as any);

  return Sentry.withServerActionInstrumentation(
    `ActionHandler error for endpoint: ${endpoint} and method: ${method}`,
    { formData },
    async () => {
      try {
        // 🔒 Get the encrypted JWT
        const token = process.env.BYPASS ? mockToken : await getToken();
        // get the user_guid from the JWT
        const userGuid =
          token?.user_guid || getUUIDFromEndpoint(endpoint) || "";

        // Add user_guid to Django API Authorization header
        const defaultOptions: RequestInit = {
          cache: "no-store", // Default cache option
          method,
          headers: new Headers({
            Authorization: JSON.stringify({
              user_guid: userGuid,
            }),
          }),
        };

        const mergedOptions: RequestInit = {
          ...defaultOptions,
          ...options, // Merge the provided options, allowing cache to be overridden
        };

        const response = await fetch(
          `${process.env.API_URL}${endpoint}`,
          mergedOptions,
        );
        if (!response.ok) {
          const res = await response.json();

          // Handle API errors, if any
          if ("message" in res) return { error: res.message };

          // Handle HTTP errors, e.g., response.status is not in the 200-299 range
          return { error: `HTTP error! Status: ${response.status}` };
        }

        const data = await response.json();

        if (pathToRevalidate) revalidatePath(pathToRevalidate);

        return data;
      } catch (error: unknown) {
        // Handle any errors, including network issues
        if (error instanceof Error) {
          // eslint-disable-next-line no-console
          console.error(`An error occurred while fetching ${endpoint}:`, error);
          return {
            // eslint-disable-next-line no-console
            error: `An error occurred while fetching ${endpoint}: ${error.message}`,
          };
        } else {
          // eslint-disable-next-line no-console
          console.error(`An unknown error occurred while fetching ${endpoint}`);
          return {
            error: `An unknown error occurred while fetching ${endpoint}`,
          };
        }
      }
    },
  );
}

// 🛠️ Function to get .env vars from server-side
export async function getEnvValue(key: string) {
  const publicEnvAllowList = ["NODE_ENV", "SITEMINDER_KEYCLOAK_LOGOUT_URL"];
  // Check if the key is in the allow list so that we don't expose sensitive env vars
  if (!publicEnvAllowList.includes(key)) throw new Error("Invalid env key");

  return process.env[key];
}
