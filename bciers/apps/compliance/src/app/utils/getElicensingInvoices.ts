import {
  ComplianceSummary,
  ElicensingInvoice,
} from "@/compliance/src/app/types";
import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";

export const getElicensingInvoices = async (params: {
  [key: string]: any;
}): Promise<{
  rows: ElicensingInvoice[];
  row_count: number;
}> => {
  const queryParams = buildQueryParams(params);

  const data = await actionHandler(
    `compliance/elicensing-invoices${queryParams}`,
    "GET",
    "",
  );

  if (!data || data.error) {
    throw new Error(`Failed to fetch invoices`);
  }

  return {
    rows: data.items,
    row_count: data.count ?? 0,
  };
};
