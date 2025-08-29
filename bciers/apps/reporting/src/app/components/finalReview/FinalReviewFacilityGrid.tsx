import DataGrid from "@bciers/components/datagrid/DataGrid";
import React, { useMemo, useState } from "react";
import {
  GridColDef,
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";

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
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );
  const columns: GridColDef[] = [
    {
      field: "facility_name",
      headerName: "Facility Name",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      width: 160,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
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
              `/reports/${version_id}/final-review/lfo?facility_id=${params.row.facility}`,
            )
          }
          data-testid={`view-details-${params.row.facility}`}
        >
          View Details
        </button>
      ),
    },
  ];

  const facilityGroupColumns = (
    SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
  ) => {
    return [
      createColumnGroup("facility_name", "Facility Name", SearchCell),
    ] as GridColumnGroupingModel;
  };

  const columnGroup = useMemo(
    () => facilityGroupColumns(SearchCell),
    [SearchCell],
  );
  return (
    <div className={"w-full mb-5"}>
      <div className="w-full form-group field field-object form-heading-label">
        <div className="form-heading">Report Information</div>
      </div>
      <DataGrid
        columns={columns}
        columnGroupModel={columnGroup}
        initialData={{ rows: data }}
        getRowId={(row) => row.facility}
        paginationMode="client"
        pageSize={10}
        rowSelection={false}
        sx={{ minHeight: 200 }}
      />
    </div>
  );
};

export default FinalReviewFacilityGrid;
