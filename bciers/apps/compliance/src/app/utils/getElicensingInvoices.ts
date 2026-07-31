import { ElicensingInvoice } from "@/compliance/src/app/types";
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

  return {
    rows: data.items,
    row_count: data.count,
  };
};
