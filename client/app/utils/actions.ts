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

export const operationSubmitHandler = async (
  formData: OperationsFormData,
  method: "POST" | "PUT",
) => {
  try {
    const response = await fetch(
      method === "POST"
        ? process.env.API_URL + "registration/operations"
        : process.env.API_URL + `registration/operations/${formData.id}`,
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
    return {res: res, ok: response.ok};
  } catch (err: any) {
    return { error: err.message };
  }
};

// TODO: remove this handler, use more generic createSubmitHandler instead
/**
 * Creates a submit handler function that sends a request to the specified API endpoint
 * and returns the response as a JSON object.
 * @param method The HTTP method to use for the request (GET, POST, PUT, DELETE, PATCH).
 * @param apiUrl The relative URL of the API endpoint to send the request to.
 * @param pathToRevalidate The path of the data to revalidate after the request is complete.
 * @param formData Data to include in the request body
 * @returns A Promise that resolves to the JSON response from the API endpoint, or an error object if the request fails.
 */
export const operationStatusUpdateHandler = async (formData: OperationsFormData) => {
  try {
    const response = await fetch(process.env.API_URL + `registration/operations/${formData.id}/update-status`, {
      method: "PUT",
      headers: {'content-type': 'application/json;charset=UTF-8'},
      body: JSON.stringify({status: formData.status})
    })
    if (!response.ok) {
      throw new Error("Failed to update status of application!");

    }
    revalidatePath("/operations")
    return await response.json()
  } catch (err: any) {
    return { error: err.message}
  }
}
