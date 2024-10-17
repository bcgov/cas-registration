import { actionHandler } from "../actions";
import { ProductData } from "../../../types/src/form/productionData";

async function postProductionData(
  report_version_id: number,
  facility_id: string,
  data: ProductData[],
) {
  const endpoint = `reporting/report-version/${report_version_id}/facilities/${facility_id}/production-data`;
  return actionHandler(endpoint, "POST", endpoint, {
    body: JSON.stringify(data),
  });
}

export default postProductionData;
