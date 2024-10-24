import { actionHandler } from "@bciers/actions";

async function getOperationRepresentatives(id: string) {
  return await actionHandler(
    `registration/operations/${id}/operation-representatives`,
    "GET",
    "",
  );
}

export default getOperationRepresentatives;
