import { actionHandler } from "@bciers/actions";

async function getOperationStatutoryDeclaration(id: string) {
  const response = await actionHandler(
    `registration/v2/operations/${id}/registration/statutory-declaration`,
    "GET",
    "",
  );
  return response;
}

export default getOperationStatutoryDeclaration;
