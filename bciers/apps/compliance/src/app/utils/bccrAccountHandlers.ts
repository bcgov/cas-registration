import { BccrAccountDetailsResponse } from "@/compliance/src/app/types";
import { actionHandler } from "@bciers/actions";

export const getBccrAccountDetails = async (
  accountId: string,
  complianceReportVersionId: number,
): Promise<BccrAccountDetailsResponse> => {
  const response = await actionHandler(
    `compliance/bccr/accounts/${accountId}/compliance-report-versions/${complianceReportVersionId}`,
    "GET",
  );
  if (!response || response?.error) {
    throw new Error(response.error || "Failed to fetch BCCR account details");
  }
  return response;
};
