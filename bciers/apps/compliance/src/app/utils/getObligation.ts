import { actionHandler } from "@bciers/actions";
import { ObligationData } from "@/compliance/src/app/types";

export const getObligationData = async (
  complianceReportVersionId: number,
): Promise<ObligationData> => {
  const data = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/obligation`,
    "GET",
    "",
  );

  return data as ObligationData;
};
