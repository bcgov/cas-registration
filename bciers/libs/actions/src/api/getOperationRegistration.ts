import { actionHandler } from "@bciers/actions";

async function getOperationRegistration(id: string) {
  return actionHandler(
    `registration/v2/operations/${id}/registration/operation`,
    "GET",
    "",
  );
}

export default getOperationRegistration;
