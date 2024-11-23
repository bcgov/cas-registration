import { actionHandler } from "@bciers/actions";
import { Product, ProductData } from "@bciers/types/form/productionData";

export async function getEmissionAllocations(
  report_version_id: number,
  facility_id: string,
) {
  const endpoint = `reporting/report-version/${report_version_id}/facilities/${facility_id}/allocate-emissions`;
  return actionHandler(endpoint, "GET") as Promise<{
    report_products: ProductData[];
    allowed_products: Product[];
  }>;
}
