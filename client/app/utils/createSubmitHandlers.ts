"use server";
import { revalidatePath } from "next/cache";

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
      throw new Error(res.detail || "Failed to submit data.");
    }
    revalidatePath(pathToRevalidate);
    return res;
  } catch (err: any) {
    return { error: err.message };
  }
};
