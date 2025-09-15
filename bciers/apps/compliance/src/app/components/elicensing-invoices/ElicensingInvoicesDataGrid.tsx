"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import { ElicensingInvoice } from "@/compliance/src/app/types";
import { getPaymentSummariesPageData } from "@/compliance/src/app/utils/getPaymentSummariesPageData";
import elicensingInvoiceColumns from "../datagrid/models/elicensingInvoices/elicensingInvoiceColumns";
import { getElicensingInvoices } from "../../utils/getElicensingInvoices";

const ElicensingInvoicesDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: ElicensingInvoice[];
    row_count: number;
  };
}) => {
  const columns = elicensingInvoiceColumns();

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
