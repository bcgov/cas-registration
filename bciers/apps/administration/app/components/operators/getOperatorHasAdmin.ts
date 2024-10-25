import { actionHandler } from "@bciers/actions";

// 🛠️ Function to get an operator administrator by operator id
export default async function getOperatorHasAdmin(id: string) {
  const response = await actionHandler(
    `registration/operators/${id}/has-admin`,
    "GET",
    `/select-operator/confirm/${id}`,
  );
  return response;
}
