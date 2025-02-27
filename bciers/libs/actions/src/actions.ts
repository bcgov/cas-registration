/**
📚 Server Actions:
 Server actions are JavaScript async functions that run on the server
and can be called from server components or from client components.

💡 You can define Server actins in RSC or define multiple Server Actions in a single file.
*/
"use server";

import { cookies } from "next/headers";
import { ContentItem } from "@bciers/types/tiles";
import getUUIDFromEndpoint from "@bciers/utils/src/getUUIDFromEndpoint";
import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import { mockToken } from "@/dashboard/auth/mockSession";

// 🛠️ Function to get the encrypted JWT from NextAuth getToken route function
export async function getToken() {
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH) return mockToken as any;
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/token`, {
      method: "POST",
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
    for (const [key, value] of Object.entries(safeJsonParse(options.body)))
      formData.append(key, value as any);

  return Sentry.withServerActionInstrumentation(
    `ActionHandler error for endpoint: ${endpoint} and method: ${method}`,
    { formData },
    async () => {
      try {
        // 🔒 Get the encrypted JWT
        const token = await getToken();

        // get the user_guid from the JWT
        const userGuid =
          token?.user_guid || getUUIDFromEndpoint(endpoint) || "";

        // strip any guid param from endpoint url
        if (userGuid) {
          endpoint = endpoint.replace(`/${userGuid}`, ""); // if there's no userGuid, this replaces slashes
        }
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

          // if we have an error message, we want to capture it in Sentry otherwise we want to capture the status code
          const error = res.message || `HTTP error! Status: ${response.status}`;
          Sentry.captureException(new Error(error));

          // Handle API errors, if any
          if ("message" in res) return { error: res.message };

          // Handle HTTP errors, e.g., response.status is not in the 200-299 range
          return { error: `HTTP error! Status: ${response.status}` };
        }

        const data = await response.json();

        if (pathToRevalidate) revalidatePath(pathToRevalidate);

        return data;
      } catch (error: unknown) {
        Sentry.captureException(error as Error);
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

// 🛠️ Function to get dashboard tiles
export async function fetchDashboardData(url: string) {
  try {
    // fetch data from server
    const response = await actionHandler(url, "GET", "");
    // Pretty-print the data
    const data = JSON.stringify(response[0].data.tiles, null, 2);
    // Parse data to object
    const object = safeJsonParse(data);
    // Assert the object as ContentType
    return object as ContentItem[];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`An error occurred while fetching dashboard data: ${error}`);
    return {};
  }
}
