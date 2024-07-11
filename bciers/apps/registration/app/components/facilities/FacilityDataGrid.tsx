"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import facilityColumns from "../datagrid/models/facilities/facilityColumns";
import facilityGroupColumns from "../datagrid/models/facilities/facilityGroupColumns";
import { FacilityRow } from "./types";
import createFetchFacilitiesPageData from "./createFetchFacilitiesPageData";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import ActionCellFactory from "../datagrid/ActionCellFactory";
import { GridRenderCellParams } from "@mui/x-data-grid";

const FacilitiesActionCell = ActionCellFactory({
  generateHref: (params: GridRenderCellParams) => {
    return `facilities/${params.row.id}`;
  },
  replace: true,
  className: "no-underline text-bc-link-blue whitespace-normal",
  cellText: "View Details",
});

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
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const ActionCell = useMemo(() => FacilitiesActionCell, []);

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
