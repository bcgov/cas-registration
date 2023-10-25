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

export const operationStatusUpdateHandler = async (formData: OperationsFormData) => {
  try {
    console.log(JSON.stringify(formData))
    const response = await fetch(process.env.API_URL + `registration/operations/${formData.id}/updateStatus`, {
      method: "PUT", body: JSON.stringify({status: formData.status})
    })
    console.log(response.json())
    if (!response.ok) {
      throw new Error("Failed to update status of application!");

    }
    revalidatePath("/operations")
    return await response.json()
  } catch (err: any) {
    return { error: err.message}
  }
}
