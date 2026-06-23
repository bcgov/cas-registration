import { ElicensingInvoice } from "@/compliance/src/app/types";
import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";

export const getPenaltyAccrualCalculationData = async (
  obligationId: number,
  params: {
    [key: string]: any;
  },
): Promise<{
  penaltyData: any;
}> => {
  const queryParams = buildQueryParams(params);

  console.log(queryParams);

  const data = await actionHandler(
    `compliance/penalties/obligation/${obligationId}/calculate-penalty${queryParams}`,
    "GET",
    "",
  );

  if (!data || data.error) {
    throw new Error(`Failed to fetch invoices`);
  }

  return data;
};
