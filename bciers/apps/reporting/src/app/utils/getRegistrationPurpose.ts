import { actionHandler } from "@bciers/actions";

export async function getRegistrationPurpose(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/registration_purpose`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the registration purpose for report version ${reportVersionId}`,
    );
  }
  return response;
}
