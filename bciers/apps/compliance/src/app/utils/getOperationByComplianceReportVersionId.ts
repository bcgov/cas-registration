import { actionHandler } from "@bciers/actions";

interface Operation {
  name: string;
}

const getOperationByComplianceReportVersionId = async (
  complianceReportVersionId?: number,
): Promise<Operation> => {
  const operation: Operation = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/operation`,
    "GET",
    "",
  );
  return operation;
};

export default getOperationByComplianceReportVersionId;
