import { actionHandler } from "@bciers/actions";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { OperationTypes } from "@bciers/utils/src/enums";

export async function getReportNeedsVerification(reportVersionId: number) {
  // 🚀 Fetch the operation associated with the specified version ID
  const reportOperation = await getReportingOperation(reportVersionId);
  // Check for EIO bypass
  const operationType = reportOperation?.operation_type;
  if (operationType === OperationTypes.EIO) {
    return true;
  }
  const endpoint = `reporting/report-version/${reportVersionId}/report-needs-verification`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the verification requirement for report version ${reportVersionId}.`,
    );
  }
  return response;
}
