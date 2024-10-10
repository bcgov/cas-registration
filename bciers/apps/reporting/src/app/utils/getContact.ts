import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch a contact by id
export default function getContact(id: string) {
  return actionHandler(`registration/contacts/${id}`, "GET", `/contacts/${id}`);
}
