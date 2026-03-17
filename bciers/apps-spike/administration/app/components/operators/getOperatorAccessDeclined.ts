import { actionHandler } from "@bciers/actions";

// 🛠️ Function to get an operator administrator with access declined status by operator id
export default async function getOperatorAccessDeclined(id: string) {
  const response = await actionHandler(
    `registration/operators/${id}/access-declined`,
    "GET",
    `/select-operator/confirm/${id}`,
  );
  return response;
}
