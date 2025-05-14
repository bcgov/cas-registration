"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import OperationsActionCell from "@bciers/components/datagrid/cells/operations/OperationsActionCell";
import OperationFacilitiesActionCell from "apps/administration/app/components/operations/cells/OperationFacilitiesActionCell";
import operationColumns from "@/administration/app/components/datagrid/models/operations/operationColumns";
import operationGroupColumns from "@/administration/app/components/datagrid/models/operations/operationGroupColumns";
import { OperationRow, OperationsSearchParams } from "./types";
import { fetchOperationsPageData } from "@bciers/actions/api";

const OperationDataGrid = ({
  initialData,
  isInternalUser = false,
  filteredSearchParams,
}: {
  isInternalUser?: boolean;
  initialData: {
    rows: OperationRow[];
    row_count: number;
  };
  filteredSearchParams: OperationsSearchParams;
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

  const fetchPageDataWithFilters = async (params: OperationsSearchParams) => {
    return fetchOperationsPageData({
      ...filteredSearchParams,
      ...params,
    });
  };

  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={fetchPageDataWithFilters}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default OperationDataGrid;
