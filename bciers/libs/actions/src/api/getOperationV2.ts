import { actionHandler } from "@bciers/actions";

async function getOperationV2(id: string) {
  try {
    return await actionHandler(`registration/v2/operation/${id}`, "GET", "");
  } catch (error) {
    throw error;
  }
}

export default getOperationV2;
