import React, { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import {
  GridColDef,
  GridColumnGroupingModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import { fetchFacilitiesPageData } from "@reporting/src/app/components/reportInformation/facilities/fetchFacilitiesPageData";

interface Facility {
  facility: string;
  facility_name: string;
}

interface FinalReviewFacilityGridProps {
  data: Facility[];
  version_id: number;
}

const FinalReviewFacilityGrid: React.FC<FinalReviewFacilityGridProps> = ({
  data,
  version_id,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = usePathname();
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  // Memoized Header Search Cell
  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField],
  );

  // Memoized columns
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "facility_name",
        headerName: "Facility Name",
        flex: 1,
        sortable: false,
      },
      {
        field: "action",
        headerName: "Action",
        width: 160,
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams) => (
          <button
            style={{
              color: "#1976d2",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() =>
              router.push(`${currentPath}/facility/${row.facility}`)
            }
            data-testid={`view-details-${row.facility}`}
          >
            View Details
          </button>
        ),
      },
    ],
    [router, version_id],
  );

  // Column group for search
  const columnGroup = useMemo<GridColumnGroupingModel>(
    () => [createColumnGroup("facility_name", "Facility Name", SearchCell)],
    [SearchCell],
  );

  // Server-side fetch for grid
  const fetchPageData = useCallback(async () => {
    const params = Object.fromEntries(searchParams.entries());
    const { rows, row_count: totalRowCount } = await fetchFacilitiesPageData({
      version_id,
      searchParams: params,
    });

    // Map only the fields needed for the grid
    return {
      rows: rows.map((r: Facility) => ({
        facility: r.facility,
        facility_name: r.facility_name,
      })),
      row_count: totalRowCount,
    };
  }, [version_id, searchParams]);

  return (
    <div className="w-full mb-5">
      <div className="w-full form-group field field-object form-heading-label">
        <div className="form-heading">Report Information</div>
      </div>

      <DataGrid
        columns={columns}
        columnGroupModel={columnGroup}
        fetchPageData={fetchPageData}
        paginationMode="client"
        initialData={{ rows: data }}
        getRowId={(row) => row.facility}
        pageSize={10}
        rowSelection={false}
        sx={{ minHeight: 200 }}
      />
    </div>
  );
};

export default FinalReviewFacilityGrid;
