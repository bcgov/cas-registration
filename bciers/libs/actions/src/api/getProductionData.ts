import { actionHandler } from "../actions";
import { Product, ProductData } from "../../../types/src/form/productionData";

async function getProductionData(
  report_version_id: number,
  facility_id: string,
) {
  const endpoint = `reporting/report-version/${report_version_id}/facilities/${facility_id}/production-data`;
  return actionHandler(endpoint, "GET") as Promise<{
    report_products: ProductData[];
    allowed_products: Product[];
  }>;
}

export default getProductionData;
