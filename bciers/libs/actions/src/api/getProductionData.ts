import { actionHandler } from "../actions";
import { Product, ProductData } from "../../../types/src/form/productionData";

async function getProductionData(
  report_version_id: number,
  facility_id: string,
) {
  const endpoint = `reporting/v2/report-version/${report_version_id}/facilities/${facility_id}/forms/production-data`;
  const response = await (actionHandler(endpoint, "GET") as Promise<{
    report_data: {
      reporting_year: number;
      facility_type: string;
    };
    facility_data: {
      facility_type: string;
    };
    report_operation: {
      operation_opted_out_final_reporting_year: number | null;
    };
    payload: {
      report_products: ProductData[];
      allowed_products: Product[];
      operation_opted_out_final_reporting_year: number | null;
    };
  }>);

  return response;
}

export default getProductionData;
