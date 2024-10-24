import { actionHandler } from "@bciers/actions";

async function getOperation(id: string) {
  return await actionHandler(`registration/operations/${id}`, "GET", "");
}

export default getOperation;
