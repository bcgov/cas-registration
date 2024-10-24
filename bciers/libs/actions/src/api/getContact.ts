import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch a contact by id
export default async function getContact(
  id: string,
  pathToRevalidate: string = "",
) {
  return await actionHandler(
    `registration/contacts/${id}`,
    "GET",
    pathToRevalidate,
  );
}
