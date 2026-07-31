import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";
import { Operator } from "@/administration/app/components/userOperators/types";

// 🛠️ Function to get an operator by operator id
export default async function getOperatorConfirmationInfo(
  id: UUID,
  pathToRevalidate: string = "",
): Promise<Operator> {
  const response = await actionHandler(
    `registration/operators/${id}/confirm`,
    "GET",
    pathToRevalidate,
  );
  return response;
}
