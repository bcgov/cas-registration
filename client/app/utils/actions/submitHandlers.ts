"use server";
import { revalidatePath } from "next/cache";
import { OperationsFormData } from "../components/Form/operationsForm";

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
      throw new Error("i broke :(");
    }
    revalidatePath("/operations");
    return await response.json();
  } catch (err: any) {
    console.log("is there an error");
    return { error: err.message };
  }
};
