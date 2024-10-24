import { actionHandler } from "@bciers/actions";

async function getOptedInOperationDetail(id: string) {
  const response = await actionHandler(
    `registration/v2/operations/${id}/registration/opted-in-operation-detail`,
    "GET",
    "",
  );
  return response;
}

export default getOptedInOperationDetail;
