import { actionHandler } from "../actions";
import { Product, ProductData } from "../../../types/src/form/productionData";

async function getProductionData(
  report_version_id: number,
  facility_id: string,
) {
  const endpoint = `reporting/v2/report-version/${report_version_id}/facilities/${facility_id}/forms/production-data`;
  const response = await (actionHandler(endpoint, "GET") as Promise<{
    payload: {
      report_products: ProductData[];
      allowed_products: Product[];
    };
  }>);

  console.log(response);

  return response.payload;
}

export default getProductionData;
