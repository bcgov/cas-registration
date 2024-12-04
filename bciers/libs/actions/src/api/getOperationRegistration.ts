import { actionHandler } from "@bciers/actions";

async function getOperationRegistration(id: string) {
  return actionHandler(
    `registration/operations/${id}/registration/operation`,
    "GET",
    "",
  );
}

export default getOperationRegistration;
