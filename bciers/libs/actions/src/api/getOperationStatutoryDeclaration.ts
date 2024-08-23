import { actionHandler } from "@bciers/actions";

async function getOperationStatutoryDeclaration(id: string) {
  try {
    return await actionHandler(
      `registration/v2/operations/${id}/registration/statutory-declaration`,
      "GET",
      "",
    );
  } catch (error) {
    throw error;
  }
}

export default getOperationStatutoryDeclaration;
