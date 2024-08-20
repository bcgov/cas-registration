import { actionHandler } from "@bciers/actions";

async function getOptedInOperationDetail(id: string) {
  try {
    return await actionHandler(
      `registration/v2/operations/${id}/registration/opted-in-operation-detail`,
      "GET",
      "",
    );
  } catch (error) {
    throw error;
  }
}

export default getOptedInOperationDetail;
