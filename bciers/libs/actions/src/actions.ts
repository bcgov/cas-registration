/**
📚 Server Actions:
 Server actions are JavaScript async functions that run on the server
and can be called from server components or from client components.

💡 You can define Server actions in RSC or define multiple Server Actions in a single file.
*/
"use server";

import { cookies } from "next/headers";
import { ContentItem } from "@bciers/types/tiles";
import getUUIDFromEndpoint, {
  ENDPOINT_NOT_ALLOWED_ERROR,
} from "@bciers/utils/src/getUUIDFromEndpoint";
import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { captureException } from "@bciers/sentryConfig/sentry";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";

const FORM_METHODS = ["POST", "PUT", "PATCH"] as const;

const shouldReturnError = (method: string, status: number, res: any) => {
  if (
    FORM_METHODS.includes(method as any) &&
    status >= 400 &&
    status < 500 &&
    Array.isArray(res?.errors)
  ) {
    return true;
  }

  // Dashboard/operator checks may return plain 401 when the user has no operator.
  if (method === "GET" && status === 401) {
    return true;
  }

  return false;
};

// Helper function to parse action handler errors
const parseHandlerError = (res: any, status: number) => {
  // Handle structured validation errors
  if ("errors" in res) {
    return {
      error: res.message,
      validation: res,
    };
  }

  // Handle API errors, if any
  if ("message" in res) return { error: res.message };

  // Handle HTTP errors
  return { error: `HTTP error! Status: ${status}` };
};

// Helper function to format caught errors
/* eslint-disable no-console */
const formatError = (error: any, endpoint: string) => {
  if (error instanceof Error) {
    console.error("An error occurred while fetching %s:", endpoint, error);
    if (error.message === ENDPOINT_NOT_ALLOWED_ERROR) {
      return {
        error: `Your session has timed out. Please log in again at https://industrialemissions.gov.bc.ca/onboarding to continue.`,
      };
    }
    return {
      error: `An error occurred while fetching ${endpoint}: ${error.message}`,
    };
  }
  console.error(`An unknown error occurred while fetching ${endpoint}`);
  return {
    error: `An unknown error occurred while fetching ${endpoint}`,
  };
};
/* eslint-enable no-console */

// 🛠️ Function to get the encrypted JWT from NextAuth getToken route function
export async function getToken() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/token`, {
      method: "POST",
      headers: { Cookie: (await cookies()).toString() },
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
 * @param endpoint The relative URL of the API endpoint to send the request to.
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
        const requestHeaders = new Headers({
          Authorization: JSON.stringify({
            user_guid: userGuid,
          }),
        });

        // Passing mock time cookie through if present
        // Except in production
        const clientCookies = await cookies();
        const mockTime = clientCookies.get("mock-time")?.value;
        if (process.env.ENVIRONMENT !== "prod" && mockTime) {
          requestHeaders.append("Cookie", `mock-time=${mockTime}`);
        }

        const defaultOptions: RequestInit = {
          cache: "no-store", // Default cache option
          method,
          headers: requestHeaders,
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

          const errorMessage =
            res?.message || `HTTP error! Status: ${response.status}`;

          const error = new Error(errorMessage);

          if (shouldReturnError(method, response.status, res)) {
            captureException(error, userGuid);
            return parseHandlerError(res, response.status);
          }

          throw error;
        }

        const data = await response.json();

        if (method !== "GET" && pathToRevalidate) {
          revalidatePath(pathToRevalidate);
        }

        return data;
      } catch (error: unknown) {
        // Get user_guid from token for error reporting
        const token = await getToken();
        const userGuid = token?.user_guid || "";

        captureException(error as Error, userGuid);

        if (method === "POST" || method === "PUT" || method === "PATCH") {
          return formatError(error, endpoint);
        }

        throw error;
      }
    },
  );
}

// 🛠️ Function to get .env vars from server-side
export async function getEnvValue(key: string) {
  const publicEnvAllowList = ["ENVIRONMENT", "SITEMINDER_KEYCLOAK_LOGOUT_URL"];
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
/**
 * A safe wrapper around actionHandler for client-side GET requests.
 * Catches any thrown errors and returns a standardized { data, error } object.
 */
export async function safeClientGet<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<{ data: T | null; error: string | null }> {
  try {
    // Hardcode "GET" and pass an empty path to revalidate since GETs don't revalidate paths
    const response = await actionHandler(endpoint, "GET", "", options);

    // In case actionHandler returns an inline error
    if (response && response.error) {
      return { data: null, error: response.error };
    }

    return { data: response as T, error: null };
  } catch (error: any) {
    // Intercept the thrown error
    return {
      data: null,
      error:
        error?.message || "An unexpected error occurred while fetching data.",
    };
  }
}
