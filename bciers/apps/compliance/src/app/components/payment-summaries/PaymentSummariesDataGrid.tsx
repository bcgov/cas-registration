"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import { PaymentSummary } from "@/compliance/src/app/types";
import paymentSummaryColumns from "../datagrid/models/payment-summaries/paymentSummaryColumns";
import paymentSummaryGroupColumns from "../datagrid/models/payment-summaries/paymentSummaryGroupColumns";
import { getPaymentSummariesPageData } from "@/compliance/src/app/utils/getPaymentSummariesPageData";

const PaymentSummariesDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: PaymentSummary[];
    row_count: number;
  };
}) => {
  console.log(
    "PaymentSummariesDataGrid rendered with initialData:",
    initialData,
  );
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const columns = paymentSummaryColumns();

  const columnGroup = useMemo(
    () => paymentSummaryGroupColumns(SearchCell),
    [SearchCell],
  );

  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={getPaymentSummariesPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default PaymentSummariesDataGrid;
