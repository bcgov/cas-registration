import { actionHandler } from "@bciers/actions";
import { ReportingFormResponse } from "@reporting/src/app/utils/typesApiV2";
import { ProductionDataFormPayload } from "@reporting/src/app/components/products/types";

type ProductionDataFormResponse =
  ReportingFormResponse<ProductionDataFormPayload>;

export async function getProductionData(
  reportVersionId: number,
  facilityId: string,
): Promise<ProductionDataFormResponse> {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/facilities/${facilityId}/forms/production-data`;

  const response = await actionHandler(endpoint, "GET");

  return response as ProductionDataFormResponse;
}

export default getProductionData;
