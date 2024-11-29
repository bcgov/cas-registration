import { actionHandler } from "@bciers/actions";

async function getOperationNewEntrantApplication(id: string) {
  return actionHandler(
    `registration/operations/${id}/registration/new-entrant-application`,
    "GET",
    "",
  );
}

export default getOperationNewEntrantApplication;
