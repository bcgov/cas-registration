/**
📚 Server Actions Conventions:

SA can be defined in two places:
Inside the component that uses it (Server Components only).
In a separate file (Client and Server Components), for reusability.

💡 You can define multiple Server Actions in a single file.
*/
"use server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Generic action handler that sends a request to the specified API endpoint
 * and returns the response as a JSON object.
 * @param apiUrl The relative URL of the API endpoint to send the request to.
 * @param method The HTTP method to use for the request (GET, POST, PUT, DELETE, PATCH).
 * @param pathToRevalidate The path of the data to revalidate after the request is complete.
 * @param options Optional data to include in the request body (example: body for POST, PUT, and PATCH requests, overriding cache control).
 * @param options Optional data to include in the request body (example: body for POST, PUT, and PATCH requests, overriding cache control).
 * @returns A Promise that resolves to the JSON response from the API endpoint, or an error object if the request fails.
 */
export async function actionHandler(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  pathToRevalidate: string,
  options: RequestInit = {}

) {
  try {

    const session = await getServerSession(authOptions);

    const defaultOptions: RequestInit = {
      cache: "no-store", // Default cache option
      method,
      headers: new Headers({
        'Authorization': JSON.stringify({
        'user_guid': session?.user?.user_guid
        })
      })
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
      // Handle HTTP errors, e.g., response.status is not in the 200-299 range
      return { error: `HTTP error! Status: ${response.status}` };
    }

    const data = await response.json();
    revalidatePath(pathToRevalidate);
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
}
