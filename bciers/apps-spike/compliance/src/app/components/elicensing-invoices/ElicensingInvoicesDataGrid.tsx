"use client";

import DataGrid from "@bciers/components/datagrid/DataGrid";
import { ElicensingInvoice } from "@/compliance/src/app/types";
import elicensingInvoiceColumns from "../datagrid/models/elicensingInvoices/elicensingInvoiceColumns";
import { getElicensingInvoices } from "../../utils/getElicensingInvoices";
import { useMemo, useState } from "react";
import elicensingInvoiceGroupColumns from "../datagrid/models/elicensingInvoices/elicensingInvoiceGroupColumns";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";

const ElicensingInvoicesDataGrid = ({
  initialData,
  isInternalUser,
}: {
  initialData: {
    rows: ElicensingInvoice[];
    row_count: number;
  };
  isInternalUser: boolean;
}) => {
  const columns = useMemo(
    () => elicensingInvoiceColumns(isInternalUser),
    [isInternalUser],
  );
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);
  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );
  const columnGroup = useMemo(
    () => elicensingInvoiceGroupColumns(SearchCell, isInternalUser),
    [SearchCell, isInternalUser],
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
