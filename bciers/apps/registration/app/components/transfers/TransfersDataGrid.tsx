"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { TransferRow } from "./types";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import { GridRenderCellParams } from "@mui/x-data-grid";
import transferColumns from "@/registration/app/components/datagrid/models/transfers/transferColumns";
import transferGroupColumns from "@/registration/app/components/datagrid/models/transfers/transferGroupColumns";
import fetchTransferEventsPageData from "@/registration/app/components/transfers/fetchTransferEventsPageData";

const TransfersActionCell = ActionCellFactory({
  generateHref: (params: GridRenderCellParams) => {
    return `/transfers/${params.row.id}`;
  },
  cellText: "View Details",
});

const TransfersDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: TransferRow[];
    row_count: number;
  };
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const ActionCell = useMemo(() => TransfersActionCell, []);

  const columns = useMemo(() => transferColumns(ActionCell), [ActionCell]);

  const columnGroup = useMemo(
    () => transferGroupColumns(SearchCell),
    [SearchCell],
  );

  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={fetchTransferEventsPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default TransfersDataGrid;
