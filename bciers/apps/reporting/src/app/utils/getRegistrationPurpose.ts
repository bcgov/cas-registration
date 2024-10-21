import { actionHandler } from "@bciers/actions";

export async function getRegistrationPurpose(version_id: number) {
  const response = await actionHandler(
    `reporting/report-version/${version_id}/registration_purpose`,
    "GET",
  );

  if (response && !response.error) {
    return response;
  }
}
