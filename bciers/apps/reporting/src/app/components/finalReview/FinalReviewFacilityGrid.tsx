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
  context?: string;
}

const PAGE_SIZE = 10;

const FinalReviewFacilityGrid: React.FC<FinalReviewFacilityGridProps> = ({
  data,
  version_id,
  context,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = usePathname();
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  // Determine current page from URL query
  const currentPage = Number(searchParams.get("page") ?? 1);

  // Compute initial slice immediately
  const initialRows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage]);

  const totalRows = data.length;

  // Memoized Header Search Cell
  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField],
  );

  // Columns
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
              router.push(
                `${currentPath}/facility/${row.facility}?context=${context}`,
              )
            }
            data-testid={`view-details-${row.facility}`}
          >
            View Details
          </button>
        ),
      },
    ],
    [router, currentPath],
  );

  // Column group for search
  const columnGroup = useMemo<GridColumnGroupingModel>(
    () => [createColumnGroup("facility_name", "Facility Name", SearchCell)],
    [SearchCell],
  );

  // Server-side fetch for grid
  const fetchPageData = useCallback(
    async (params: { [key: string]: any }) => {
      const response = await fetchFacilitiesPageData({
        version_id,
        searchParams: params,
      });

      return {
        rows: response.rows.map((r: Facility) => ({
          facility: r.facility,
          facility_name: r.facility_name,
        })),
        row_count: response.row_count,
      };
    },
    [version_id],
  );

  return (
    <div className="w-full mb-5">
      <div className="w-full form-group field field-object form-heading-label">
        <div className="form-heading">Report Information</div>
      </div>

      <DataGrid
        columns={columns}
        columnGroupModel={columnGroup}
        fetchPageData={fetchPageData}
        paginationMode="server"
        initialData={{ rows: initialRows, row_count: totalRows }}
        getRowId={(row) => row.facility}
        pageSize={PAGE_SIZE}
        rowSelection={false}
        sx={{ minHeight: 200 }}
      />
    </div>
  );
};

export default FinalReviewFacilityGrid;
