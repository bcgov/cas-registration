"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import { ElicensingInvoice } from "@/compliance/src/app/types";
import { getPaymentSummariesPageData } from "@/compliance/src/app/utils/getPaymentSummariesPageData";
import elicensingInvoiceColumns from "../datagrid/models/elicensingInvoices/elicensingInvoiceColumns";
import elicensingInvoiceGroupColumns from "../datagrid/models/elicensingInvoices/elicensingInvoiceGroupColumns";
import { getElicensingInvoices } from "../../utils/getElicensingInvoices";

const ElicensingInvoicesDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: ElicensingInvoice[];
    row_count: number;
  };
}) => {
  console.log("initialData", initialData);
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const columns = elicensingInvoiceColumns();

  const columnGroup = useMemo(
    () => elicensingInvoiceGroupColumns(SearchCell),
    [SearchCell],
  );

  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={getElicensingInvoices}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default ElicensingInvoicesDataGrid;
