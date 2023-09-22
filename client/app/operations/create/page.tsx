"use client";
import { useAddNewOperationMutation } from "@/redux";

export default function Page() {
  const [addNewOperation, { isLoading }] = useAddNewOperationMutation();

  const onSaveOperationClicked = async () => {
    if (!isLoading) {
      try {
        await addNewOperation(formData).unwrap();
      } catch (err) {
        console.error("Failed to save the post: ", err);
      }
    }
  };

  return <div>imma on create page</div>;
}
