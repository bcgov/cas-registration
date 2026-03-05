import { actionHandler } from "@bciers/actions";

interface ReportOperation {
  operation_name: string;
}

const getReportOperationByComplianceReportVersionId = async (
  complianceReportVersionId?: number,
): Promise<ReportOperation> => {
  const reportOperation: ReportOperation = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/operation`,
    "GET",
    "",
  );
  return reportOperation;
};

export default getReportOperationByComplianceReportVersionId;
