import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch a contact by id
export default async function getContact(
  id: string,
  pathToRevalidate: string = "",
) {
  return actionHandler(
    `registration/v2/contacts/${id}`,
    "GET",
    pathToRevalidate,
  );
}
