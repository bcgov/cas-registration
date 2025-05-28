import { actionHandler } from "@bciers/actions";

interface Operation {
  name: string;
}

const getOperationByComplianceSummaryId = async (
  complianceSummaryId?: string,
): Promise<Operation> => {
  const operation: Operation = await actionHandler(
    `compliance/compliance-report-versions/${complianceSummaryId}/operation`,
    "GET",
    "",
  );
  return operation;
};

export default getOperationByComplianceSummaryId;
