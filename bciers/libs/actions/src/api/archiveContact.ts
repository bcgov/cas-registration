import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch a contact by id
export default async function archiveContact(
  id: string,
  pathToRevalidate: string = "",
) {
  return actionHandler(
    `registration/contacts/${id}`,
    "PATCH",
    pathToRevalidate,
  );
}
