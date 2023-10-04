"use server";
import { revalidatePath } from "next/cache";
import { OperationsFormData } from "../../components/form/OperationsForm";

export const operationSubmitHandler = async (
  formData: OperationsFormData,
  method: "POST" | "PUT",
) => {
  try {
    const response = await fetch(
      method === "POST"
        ? "http://localhost:8000/api/registration/operations"
        : `http://localhost:8000/api/registration/operations/${formData.id}`,
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
