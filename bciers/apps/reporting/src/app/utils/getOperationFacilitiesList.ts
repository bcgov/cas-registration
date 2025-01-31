import { actionHandler } from "@bciers/actions";
// Fetches the facility list for the operation associated with the given report version ID
export async function getOperationFacilitiesList(version_id: number) {
  const response = await actionHandler(
    `reporting/report-version/${version_id}/review-facilities`,
    "GET",
  );
  if (response && !response.error) {
    return response;
  }
}
