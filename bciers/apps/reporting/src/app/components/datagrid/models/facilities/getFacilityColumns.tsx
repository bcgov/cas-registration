"use client";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import * as React from "react";
import { useRouter } from "next/navigation";
import getCheckboxColumnCell from "@bciers/components/datagrid/cells/CheckboxColumnCell";

const ActionCell = ({
  row,
  version_id,
}: GridRenderCellParams & { version_id: number }) => {
  const isCompleted = row?.is_completed;
  const id = row.facility;
  const router = useRouter();

  const handleRedirect = () => {
    const url = `/reporting/reports/${version_id}/facilities/${id}/review-facility-information`;
    router.push(url);
  };

  if (isCompleted) {
    return (
      <Button color="primary" onClick={handleRedirect}>
        View Details
      </Button>
    );
  }

  return (
    <Button color="primary" onClick={handleRedirect}>
      Continue
    </Button>
  );
};

const getFacilityColumns = (
  onCheckBoxChange: (rowIndex: number, checked: boolean) => void,
  version_id: number,
): GridColDef[] => {
  return [
    {
      field: "facility_name",
      headerName: "Facility Name",
      width: 560,
      sortable: true,
      flex: 1,
    },
    {
      field: "facility_bcghgid",
      headerName: "Facility BCGHG ID",
      width: 200,
      sortable: true,
    },
    {
      field: "is_completed",
      headerName: "Status",
      renderCell: getCheckboxColumnCell(onCheckBoxChange),
      align: "center",
      headerAlign: "center",
      sortable: false,
      width: 200,
    },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <ActionCell {...params} version_id={version_id} />
      ),
      sortable: false,
      width: 300,
    },
  ];
};

export default getFacilityColumns;
