import { actionHandler } from "@bciers/actions";

async function getOperationV2(id: string) {
  return await actionHandler(`registration/v2/operations/${id}`, "GET", "");
}

export default getOperationV2;
