import { actionHandler } from "@bciers/actions";

async function getOperationStatutoryDeclaration(id: string) {
  return actionHandler(
    `registration/v2/operations/${id}/registration/statutory-declaration`,
    "GET",
    "",
  );
}

export default getOperationStatutoryDeclaration;
