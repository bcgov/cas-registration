import { PaymentSummary } from "@/compliance/src/app/types";
import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";

export const getPaymentSummariesPageData = async (params: {
  [key: string]: any;
}): Promise<{
  rows: PaymentSummary[];
  row_count: number;
}> => {
  // eslint-disable-next-line
  const queryParams = buildQueryParams(params); // Ignore until #193 is complete

  const data = await actionHandler(`compliance/dashboard-payments?`, "GET", "");

  if (!data || data.error) {
    throw new Error(`Failed to fetch compliance summaries: ${data.error}`);
  }

  return {
    rows: data.rows,
    row_count: data.row_count ?? 0,
  };
};
