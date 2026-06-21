import { actionHandler } from "@bciers/actions";

export async function getRegistrationPurpose(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/registration_purpose`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}
