import { actionHandler } from "@bciers/actions";

export async function pickupPassengers(
  reportVersionId: number,
  facilityId?: number,
) {
  let endpoint = `reporting/comments/version_id/${reportVersionId}`;

  if (facilityId) {
    endpoint += `?facility_id=${facilityId}`;
  }

  const response = await actionHandler(endpoint, "GET");
  return response;
}
