import { actionHandler } from "@bciers/actions";

async function getOptedInOperationDetail(id: string) {
  return actionHandler(
    `registration/operations/${id}/registration/opted-in-operation-detail`,
    "GET",
    "",
  );
}

export default getOptedInOperationDetail;
