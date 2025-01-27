"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import facilityGroupColumns from "@reporting/src/app/components/datagrid/models/facilities/facilityGroupColumns";
import operationColumns from "@reporting/src/app/components/datagrid/models/operations/operationColumns";
import { FacilityRow } from "@reporting/src/app/components/operations/types";
import { fetchOperationsPageData } from "@bciers/actions/api";
import facilityColumns from "@reporting/src/app/components/datagrid/models/facilities/facilityColumns";

const FacilitiesDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: FacilityRow[];
    row_count: number;
  };
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const columns = facilityColumns();

  const columnGroup = useMemo(
    () => facilityGroupColumns(false, SearchCell),
    [SearchCell],
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

export default FacilitiesDataGrid;
