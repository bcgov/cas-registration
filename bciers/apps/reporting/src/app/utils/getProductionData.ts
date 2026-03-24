import { actionHandler } from "@bciers/actions";
import { ReportingFormResponse } from "@reporting/src/app/utils/typesApiV2";
import { ProductionDataFormPayload } from "@reporting/src/app/components/products/types";

type ProductionDataResponse = ReportingFormResponse<ProductionDataFormPayload>;

export async function getProductionData(
  reportVersionId: number,
  facilityId: string,
): Promise<ProductionDataResponse> {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/facilities/${facilityId}/forms/production-data`;

  const response = await actionHandler(endpoint, "GET");

  if ((response as any).error) {
    throw new Error(
      `Failed to fetch production data for report version ${reportVersionId} and facility ${facilityId}.`,
    );
  }

  return response as ProductionDataResponse;
}

export default getProductionData;
