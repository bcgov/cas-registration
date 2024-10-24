"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import fetchOperatorsPageData from "./fetchOperatorsPageData";
import { OperatorRow } from "./types";
import operatorColumns from "../datagrid/models/operators/operatorColumns";
import operatorGroupColumns from "../datagrid/models/operators/operatorGroupColumns";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import { GridRenderCellParams } from "@mui/x-data-grid";

const OperatorsActionCell = ActionCellFactory({
  generateHref: (params: GridRenderCellParams) => {
    return `/operators/${params.row.id}/operator-details`;
  },
  cellText: "View Details",
});

const OperatorDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: OperatorRow[];
    row_count: number;
  };
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const columns = useMemo(() => operatorColumns(OperatorsActionCell), []);

  const columnGroup = useMemo(
    () => operatorGroupColumns(SearchCell),
    [SearchCell],
  );

  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={fetchOperatorsPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default OperatorDataGrid;
