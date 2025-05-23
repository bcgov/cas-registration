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
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { useSearchParams } from "next/navigation";
const FacilitiesDataGrid = ({
  disabled,
  operationId,
  operationName,
  initialData,
  sx,
  fromRegistration,
}: {
  disabled?: boolean;
  operationId: string;
  operationName?: string;
  initialData: {
    rows: FacilityRow[];
    row_count: number;
  };
  sx?: { [key: string]: any };
  fromRegistration?: boolean;
}) => {
  const searchParams = useSearchParams();
  const operationsTitle =
    (searchParams.get("operations_title") as string) ?? operationName;
  const createFacilitiesActionCell = () =>
    ActionCellFactory({
      generateHref: (params: GridRenderCellParams) => {
        return `/administration/operations/${operationId}/facilities/${
          params.row.facility__id
        }?operations_title=${operationsTitle}&facilities_title=${
          params.row.facility__name
        }${fromRegistration ? "&from_registration=true&isNewTab=true" : ""}`;
      },
      cellText: "View Details",
      useWindowLocation: true,
      IconComponent: fromRegistration ? (
        <OpenInNewIcon fontSize="small" />
      ) : undefined,
      openInNewTab: fromRegistration,
      tooltipText: fromRegistration ? "Link opens in a new tab" : "",
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
      disabled={disabled}
      fetchPageData={createFetchFacilitiesPageData(operationId)}
      paginationMode="server"
      initialData={initialData}
      sx={sx}
    />
  );
};

export default FacilitiesDataGrid;
