import { actionHandler } from "@bciers/actions";
import { ProductData } from "@bciers/types/form/productionData";

async function postProductionData(
  reportVersionId: number,
  facilityId: string,
  data: ProductData[],
) {
  const endpoint = `reporting/report-version/${reportVersionId}/facilities/${facilityId}/production-data`;
  return actionHandler(endpoint, "POST", "", {
    body: JSON.stringify(data),
  });
}

export default postProductionData;
