import { actionHandler } from "@bciers/actions";

async function getNewEntrantOperationDetail(id: string) {
  try {
    return await actionHandler(
      `registration/v2/operations/${id}/registration/new-entrant-operation-detail`,
      "GET",
      "",
    );
  } catch (error) {
    throw error;
  }
}

export default getNewEntrantOperationDetail;
