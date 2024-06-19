"use client";

import { useMemo, useState } from "react";
import { FacilitySearchCell } from "../datagrid/cells/FacilitiesSearchCell";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import FacilitiesActionCell from "../datagrid/cells/FacilitiesActionCell";
import facilityColumns from "../datagrid/models/facilities/facilityColumns";
import facilityGroupColumns from "../datagrid/models/facilities/facilityGroupColumns";
import { FacilityRow } from "./types";
import { createFetchFacilitiesPageData } from "./utils";

const FacilityDataGrid = ({
  operationId,
  initialData,
}: {
  operationId: string;
  initialData: {
    rows: FacilityRow[];
    row_count: number;
  };
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => FacilitySearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const ActionCell = useMemo(() => FacilitiesActionCell(), []);

  const columns = useMemo(() => facilityColumns(ActionCell), [ActionCell]);

  const columnGroup = useMemo(
    () => facilityGroupColumns(SearchCell),
    [SearchCell],
  );

  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={createFetchFacilitiesPageData(operationId)}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default FacilityDataGrid;
