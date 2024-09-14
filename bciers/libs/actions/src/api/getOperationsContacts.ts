import { actionHandler } from "@bciers/actions";

async function getOperationsContacts(id: string) {
  try {
    return await actionHandler(
      `registration/operations/${id}/contacts`,
      "GET",
      "",
    );
  } catch (error) {
    throw error;
  }
}

export default getOperationsContacts;
