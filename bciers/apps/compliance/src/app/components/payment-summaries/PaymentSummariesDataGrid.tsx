"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import { PaymentSummary } from "@/compliance/src/app/types";
import paymentSummaryColumns from "../datagrid/models/payment-summaries/paymentSummaryColumns";
import paymentSummaryGroupColumns from "../datagrid/models/payment-summaries/paymentSummaryGroupColumns";
import { fetchComplianceSummariesPageData } from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";

const ComplianceSummariesDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: PaymentSummary[];
    row_count: number;
  };
}) => {
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
      fetchPageData={fetchComplianceSummariesPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default ComplianceSummariesDataGrid;
