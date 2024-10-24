import { actionHandler } from "@bciers/actions";

async function getOptedInOperationDetail(id: string) {
  return await actionHandler(
    `registration/v2/operations/${id}/registration/opted-in-operation-detail`,
    "GET",
    "",
  );
}

export default getOptedInOperationDetail;
