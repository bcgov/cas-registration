import { BccrAccountDetailsResponse } from "@/compliance/src/app/types";
import { actionHandler } from "@bciers/actions";

export const getBccrAccountDetails = async (
  accountId: string,
  complianceReportVersionId: number,
): Promise<BccrAccountDetailsResponse> => {
  return actionHandler(
    `compliance/bccr/accounts/${accountId}/compliance-report-versions/${complianceReportVersionId}`,
    "GET",
  );
};
