"use client";

import { useMemo, useState } from "react";
import { GridColumnGroupHeaderParams } from "@mui/x-data-grid";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import FacilitiesActionCell from "@bciers/components/datagrid/cells/FacilitiesActionCell";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import { fetchFacilitiesPageData } from "./Facilities";
import facilityColumns from "../datagrid/models/facilities/facilityColumns";
import facilityGroupColumns from "../datagrid/models/facilities/facilityGroupColumns";
import { FacilityRow } from "./types";

const FacilitySearchCell = ({
  lastFocusedField,
  setLastFocusedField,
}: {
  lastFocusedField: string | null;
  setLastFocusedField: (value: string | null) => void;
}) => {
  const RenderCell = (params: GridColumnGroupHeaderParams) => {
    const { groupId, headerName } = params;
    return (
      <HeaderSearchCell
        field={groupId ?? ""}
        fieldLabel={headerName ?? ""}
        isFocused={lastFocusedField === groupId}
        setLastFocusedField={setLastFocusedField}
      />
    );
  };
  return RenderCell;
};

const FacilityDataGrid = ({
  initialData,
}: {
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
      fetchPageData={fetchFacilitiesPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default FacilityDataGrid;
