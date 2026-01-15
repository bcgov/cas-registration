import { actionHandler } from "@bciers/actions";
import { OptedInOperationFormData } from "apps/registration/app/components/operations/registration/types";

async function getOptedInOperationDetail(
  id: string,
): Promise<OptedInOperationFormData> {
  return actionHandler(
    `registration/operations/${id}/registration/opted-in-operation-detail`,
    "GET",
    "",
  );
}

export default getOptedInOperationDetail;
