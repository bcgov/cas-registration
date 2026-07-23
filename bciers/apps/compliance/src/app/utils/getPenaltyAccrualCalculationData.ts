import { ElicensingInvoice } from "@/compliance/src/app/types";
import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";

export const getPenaltyAccrualCalculationData = async (
  complianceReportVersionId: number,
  params: {
    [key: string]: any;
  },
): Promise<{
  penaltyData: any;
}> => {
  const queryParams = buildQueryParams(params);

  const data = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/obligation/calculate-penalty${queryParams}`,
    "GET",
    "",
  );

  if (!data || data.error) {
    throw new Error(`Failed to fetch invoices`);
  }

  return data;
};
