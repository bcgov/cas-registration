import { actionHandler } from "@bciers/actions";

async function getOperationRepresentatives(id: string) {
  return actionHandler(
    `registration/v2/operations/${id}/operation-representatives`,
    "GET",
    "",
  );
}

export default getOperationRepresentatives;
