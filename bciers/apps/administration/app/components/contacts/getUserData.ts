import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";

// 🛠️ Function to retrieve the information of the selected user in contact form
// brianna not using
export default async function getUserData(id: UUID) {
  const response = await actionHandler(`registration/users/${id}`, "GET");
  return response;
}
