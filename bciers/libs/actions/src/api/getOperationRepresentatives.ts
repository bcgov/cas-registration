import { actionHandler } from "@bciers/actions";

async function getOperationRepresentatives(id: string) {
  const response = await actionHandler(
    `registration/operations/${id}/operation-representatives`,
    "GET",
    "",
  );
  return response;
}

export default getOperationRepresentatives;
