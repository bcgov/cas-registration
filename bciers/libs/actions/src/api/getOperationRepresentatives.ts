import { actionHandler } from "@bciers/actions";

async function getOperationRepresentatives(id: string) {
  try {
    return await actionHandler(
      `registration/operations/${id}/operation-representatives`,
      "GET",
      "",
    );
  } catch (error) {
    throw error;
  }
}

export default getOperationRepresentatives;
