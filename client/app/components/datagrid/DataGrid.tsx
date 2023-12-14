"use client";
import { useEffect, useState } from "react";
import {
  DataGrid as MuiGrid,
  GridRowsProp,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import Link from "next/link";
import { Button } from "@mui/material";

interface Props {
  rows: GridRowsProp;
  columns: GridColDef[];
  cntxt?: string;
}

const DataGrid: React.FC<Props> = ({ rows, columns, cntxt }) => {
  // 📚  Define a state variable to store columns
  const [customColumns, setCustomColumns] = useState<GridColDef[]>(columns);

  useEffect(() => {
    // 🔍 Props passed from Server Components—for example client/app/operations/page.tsx—must be serializable
    // Handling non-serializable column functions here...
    switch (cntxt) {
      case "operations":
        // 📚 Define a custom renderCell function for the 'action' column
        const updatedColumns = columns.map((column) => {
          if (column.field === "action") {
            return {
              ...column,
              renderCell: (params: GridRenderCellParams) => (
                <div>
                  {/* 🔗 Add reg or details link */}
                  <Link href={`operations/${params.row.id}/1`}>
                    <Button variant="contained">
                      {params.row.status === "Not Registered"
                        ? "Start Registration"
                        : "View Details"}
                    </Button>
                  </Link>
                </div>
              ),
            };
          }
          return column;
        });
        //  🔄 Use updatedColumns for rendering the DataGrid
        setCustomColumns(updatedColumns);
        break;
      default:
        break;
    }
  }, [columns, cntxt]);

  return (
    <div style={{ height: "auto", width: "100%" }}>
      <MuiGrid rows={rows} columns={customColumns} disableVirtualization />
    </div>
  );
};

export default DataGrid;
