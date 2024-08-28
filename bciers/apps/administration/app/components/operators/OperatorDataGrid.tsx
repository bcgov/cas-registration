"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import OperatorsActionCell from "@bciers/components/datagrid/cells/OperatorsActionCell";
import { GridRenderCellParams } from "@mui/x-data-grid";
import fetchOperatorsPageData from "./fetchOperatorsPageData";
import { OperatorRow } from "./types";
import operatorColumns from "../datagrid/models/operatorColumns";

const OperatorDataGrid = ({
  initialData,
  isInternalUser = false,
}: {
  isInternalUser?: boolean;
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

  const columns = useMemo(
    () =>
      operatorColumns(
        isInternalUser,
        OperatorsActionCell(),
        // FacilitiesActionCell,
      ),
    [isInternalUser],
  );

  // const columnGroup = useMemo(
  //   () => operatorGroupColumns(isInternalUser, SearchCell),
  //   [SearchCell, isInternalUser],
  // );

  return (
    <DataGrid
      columns={columns}
      // columnGroupModel={columnGroup}
      fetchPageData={fetchOperatorsPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default OperatorDataGrid;
