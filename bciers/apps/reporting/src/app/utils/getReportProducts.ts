import { actionHandler } from "@bciers/actions";
export async function getReportProducts(version_id: number) {
  let response = await actionHandler(
    `reporting/report-version/${version_id}/regulated-products`,
    "GET",
    `reporting/report-version/${version_id}/regulated-products`,
  );

  if (response && !response.error) {
    return response;
  }
}
