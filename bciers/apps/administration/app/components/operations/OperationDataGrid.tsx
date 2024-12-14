"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import OperationsActionCell from "@bciers/components/datagrid/cells/operations/OperationsActionCell";
import OperationFacilitiesActionCell from "apps/administration/app/components/operations/cells/OperationFacilitiesActionCell";
import operationColumns from "../datagrid/models/operations/operationColumns";
import operationGroupColumns from "../datagrid/models/operations/operationGroupColumns";
import { OperationRow } from "./types";
import fetchOperationsPageData from "@bciers/actions/api/fetchOperationsPageData";

const OperationDataGrid = ({
  initialData,
  isInternalUser = false,
}: {
  isInternalUser?: boolean;
  initialData: {
    rows: OperationRow[];
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
      operationColumns(
        isInternalUser,
        OperationsActionCell(isInternalUser),
        OperationFacilitiesActionCell(isInternalUser),
      ),
    [OperationsActionCell, isInternalUser],
  );

  const columnGroup = useMemo(
    () => operationGroupColumns(isInternalUser, SearchCell),
    [SearchCell, isInternalUser],
  );

  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={fetchOperationsPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default OperationDataGrid;
