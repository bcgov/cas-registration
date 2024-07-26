"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import facilityColumns from "../datagrid/models/facilities/facilityColumns";
import facilityGroupColumns from "../datagrid/models/facilities/facilityGroupColumns";
import { FacilityRow } from "./types";
import createFetchFacilitiesPageData from "./createFetchFacilitiesPageData";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import { GridRenderCellParams } from "@mui/x-data-grid";

import { useSearchParams } from "next/navigation";
const FacilitiesDataGrid = ({
  operationId,
  initialData,
}: {
  operationId: string;
  initialData: {
    rows: FacilityRow[];
    row_count: number;
  };
}) => {
  const searchParams = useSearchParams();
  const operationsTitle = searchParams.get("operationsTitle") as string;
  const createFacilitiesActionCell = () =>
    ActionCellFactory({
      generateHref: (params: GridRenderCellParams) => {
        return `/operations/${operationId}/facilities/${params.row.id}?operationsTitle=${operationsTitle}&facilitiesTitle=${params.row.name}`;
      },
      cellText: "View Details",
    });
  const ActionCell = useMemo(() => createFacilitiesActionCell(), []);
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

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

export default FacilitiesDataGrid;
