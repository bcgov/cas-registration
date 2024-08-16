import { actionHandler } from "@bciers/actions";

async function getOperationV2(id: string) {
  try {
    // /v2/operations/{id} was clashing with /v2/operations/current, need to fix/rename
    return await actionHandler(`registration/v2/operation/${id}`, "GET", "");
  } catch (error) {
    throw error;
  }
}

export default getOperationV2;
