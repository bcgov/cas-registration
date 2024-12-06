import { actionHandler } from "@bciers/actions";

async function getOperationsByOperatorId(operatorId: string) {
  return actionHandler(
    `registration/v2/operators/${operatorId}/operations`,
    "GET",
    "",
  );
}

export default getOperationsByOperatorId;
