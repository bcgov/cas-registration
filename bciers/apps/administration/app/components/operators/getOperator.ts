import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";

// 🛠️ Function to get an operator by operator id
export default async function getOperator(id: UUID) {
  const response = await actionHandler(
    `registration/operators/${id}`,
    "GET",
    `/select-operator/confirm/${id}`,
  );
  return response;
}
