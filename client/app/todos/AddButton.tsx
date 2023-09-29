"use client";
import { experimental_useFormStatus as useFormStatus } from "react-dom";

// Define the AddButton component
export default function AddButton() {
  // Get the pending state from useFormStatus
  const { pending } = useFormStatus();

  return (
    // Render a button element
    <button
      disabled={pending} // Disable the button if pending is true
      type="submit"
      className="bg-blue-600 disabled:bg-gray-500 inline-flex items-center justify-center rounded-full py-4 px-10 text-center text-base font-normal text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
    >
      Add Todo
    </button>
  );
}
