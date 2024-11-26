import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";

// 🛠️ Function to get an operator by operator id
export default async function getOperator(
  id: UUID,
  pathToRevalidate: string = "",
) {
  const response = await actionHandler(
    `registration/v2/operators/${id}`,
    "GET",
    pathToRevalidate,
  );
  return response;
}
