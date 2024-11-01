import { actionHandler } from "@bciers/actions";

async function getOperationNewEntrantApplication(id: string) {
  return actionHandler(
    `registration/v2/operations/${id}/registration/new-entrant-application`,
    "GET",
    "",
  );
}

export default getOperationNewEntrantApplication;
