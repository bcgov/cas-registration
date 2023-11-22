/**
📚 Server Actions Conventions:

SA can be defined in two places:
Inside the component that uses it (Server Components only).
In a separate file (Client and Server Components), for reusability.

💡 You can define multiple Server Actions in a single file.
*/
"use server";
import { revalidatePath } from "next/cache";
import { OperationsFormData } from "@/app/components/form/OperationsForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const operationSubmitHandler = async (
  formData: OperationsFormData,
  method: "POST" | "PUT",
  submit: boolean,
) => {
  try {
    const response = await fetch(
      method === "POST"
        ? process.env.API_URL + "registration/operations"
        : process.env.API_URL +
            `registration/operations/${formData.id}?submit=${submit}`,
      {
        method,
        body: JSON.stringify(formData),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to save data.");
    }
    revalidatePath("/operations");
    return await response.json();
  } catch (err: any) {
    return { error: err.message };
  }
};

/**
 * Creates a submit handler function that sends a request to the specified API endpoint
 * and returns the response as a JSON object.
 * @param method The HTTP method to use for the request (GET, POST, PUT, DELETE, PATCH).
 * @param apiUrl The relative URL of the API endpoint to send the request to.
 * @param pathToRevalidate The path of the data to revalidate after the request is complete.
 * @param formData Optional data to include in the request body (for POST, PUT, and PATCH requests).
 * @returns A Promise that resolves to the JSON response from the API endpoint, or an error object if the request fails.
 */
export const createSubmitHandler = async (
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  apiUrl: string,
  pathToRevalidate: string,
  formData?: any,
) => {
  try {
    const response: Response = await fetch(`${process.env.API_URL}${apiUrl}`, {
      method,
      body: JSON.stringify(formData),
    });

    const res = await response.json();

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.log(
        `CreateSubmitHandler: ${response.status} ${response.statusText}`,
      );

      // detail is a custom error message from the server
      throw new Error(res.message || "Failed to submit data.");
    }
    revalidatePath(pathToRevalidate);
    return { res: res, ok: response.ok };
  } catch (err: any) {
    return { error: err.message };
  }
};

export const requestAccessHandler = async (
  operatorId: number
) => {
  try {
    const response: Response = await fetch(
      process.env.API_URL + "registration/select-operator/request-access", {
        method: "POST",
        body: JSON.stringify({"operator_id": operatorId}),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to save data.");
    }
    revalidatePath(`/dashboard/select-operator/confirm/${operatorId}`);
    return await response.json();
  } catch (err: any) {
    return { error: err.message };
  }
};


export async function actionHandler(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  pathToRevalidate: string,
  options: RequestInit = {},
  latency: number = 0, // Default latency is 0 milliseconds,

) {
  try {
    // Simulate latency
    if (latency > 0) await new Promise((r) => setTimeout(r, latency));

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
