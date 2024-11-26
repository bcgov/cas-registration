import { actionHandler } from "@bciers/actions";

async function getOperation(id: string) {
  return actionHandler(`registration/v2/operations/${id}`, "GET", "");
}

export default getOperation;
