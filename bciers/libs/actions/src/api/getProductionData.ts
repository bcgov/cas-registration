import { actionHandler } from "../actions";
import { Product, ProductData } from "../../../types/src/form/productionData";
import {
  FacilityData,
  OperationData,
  ReportData,
} from "@reporting/src/app/utils/typesApiV2";

async function getProductionData(
  report_version_id: number,
  facility_id: string,
) {
  const endpoint = `reporting/v2/report-version/${report_version_id}/facilities/${facility_id}/forms/production-data`;
  const response = await (actionHandler(endpoint, "GET") as Promise<{
    report_data: ReportData;
    facility_data: FacilityData;
    operation_data: OperationData;
    payload: {
      report_products: ProductData[];
      allowed_products: Product[];
      operation_opted_out_final_reporting_year: number | null;
    };
  }>);

  return response;
}

export default getProductionData;
