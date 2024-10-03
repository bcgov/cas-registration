import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch a contact by id
export default async function getContact(
  id: string,
  pathToRevalidate: string = "",
) {
  try {
    return await actionHandler(
      `registration/contacts/${id}`,
      "GET",
      pathToRevalidate,
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}
