import { actionHandler } from "@bciers/actions";
import { OperationReviewPageData } from "@reporting/src/app/components/operations/types";

export async function getReviewOperationInformationPageData(
  reportVersionId: number,
): Promise<OperationReviewPageData> {
  const endpoint = `reporting/report-version/${reportVersionId}/report-operation-data`;
  const response = await actionHandler(endpoint, "GET");

  return response as OperationReviewPageData;
}
