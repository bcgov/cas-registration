"use client";

import DataGrid from "@bciers/components/datagrid/DataGrid";
import { ElicensingInvoice } from "@/compliance/src/app/types";
import elicensingInvoiceColumns from "../datagrid/models/elicensingInvoices/elicensingInvoiceColumns";
import { getElicensingInvoices } from "../../utils/getElicensingInvoices";
import { useMemo } from "react";

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
  return (
    <DataGrid
      columns={columns}
      fetchPageData={getElicensingInvoices}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default ElicensingInvoicesDataGrid;
