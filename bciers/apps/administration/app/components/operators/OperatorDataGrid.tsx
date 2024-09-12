"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import OperatorsActionCell from "@bciers/components/datagrid/cells/OperatorsActionCell";
import fetchOperatorsPageData from "./fetchOperatorsPageData";
import { OperatorRow } from "./types";
import operatorColumns from "../datagrid/models/operatorColumns";
import operatorGroupColumns from "../datagrid/models/operatorGroupColumns";

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

  const columns = useMemo(() => operatorColumns(OperatorsActionCell()), []);

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
