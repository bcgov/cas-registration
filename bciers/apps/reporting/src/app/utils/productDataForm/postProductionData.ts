import { actionHandler } from "@bciers/actions";
import { ProductData } from "@reporting/src/app/components/products/types";

export async function postProductionData(
  report_version_id: number,
  facility_id: string,
  data: ProductData[],
) {
  const endpoint = `reporting/report-version/${report_version_id}/facilities/${facility_id}/production-data`;
  const pathToRevalidate = `reporting/reports/${report_version_id}/facilities/${facility_id}/production-data`;
  return actionHandler(endpoint, "POST", pathToRevalidate, {
    body: JSON.stringify(data),
  });
}

export async function postUnregulatedProducts(
  report_version_id: number,
  facility_id: string,
) {
  const endpoint = `reporting/report-version/${report_version_id}/facilities/${facility_id}/unregulated-products`;
  const pathToRevalidate = `reporting/reports/${report_version_id}/facilities/${facility_id}/unregulated-products`;
  return actionHandler(endpoint, "POST", pathToRevalidate);
}
