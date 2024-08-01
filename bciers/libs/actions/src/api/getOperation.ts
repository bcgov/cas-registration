import { actionHandler } from "@bciers/actions";

async function getOperation(id: string) {
  try {
    return await actionHandler(`registration/operations/${id}`, "GET", "");
  } catch (error) {
    throw error;
  }
}

export default getOperation;
