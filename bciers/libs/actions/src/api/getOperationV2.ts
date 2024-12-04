import { actionHandler } from "@bciers/actions";

async function getOperationV2(id: string) {
  return actionHandler(`registration/operations/${id}`, "GET", "");
}

export default getOperationV2;
