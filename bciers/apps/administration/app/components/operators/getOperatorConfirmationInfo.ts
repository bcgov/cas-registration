import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";

// 🛠️ Function to get an operator by operator id
export default async function getOperatorConfirmationInfo(
  id: UUID,
  pathToRevalidate: string = "",
) {
  const response = await actionHandler(
    `registration/operators/${id}/confirm`,
    "GET",
    pathToRevalidate,
  );
  return response;
}
