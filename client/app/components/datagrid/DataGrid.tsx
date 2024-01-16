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
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@/app/styles/colors";

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
        const updatedColumnsOperations = columns.map((column) => {
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
        setCustomColumns(updatedColumnsOperations);
        break;
      case "user-operators":
        // 📚 Define a custom renderCell function for the 'action' column
        const updatedColumnsUserOperators = columns.map((column) => {
          if (column.field === "action") {
            return {
              ...column,
              renderCell: (params: GridRenderCellParams) => (
                <div>
                  {/* Link to the first page of the multistep form for a specific user-operator. The '1' represents the first formSection of the form. */}
                  <Link href={`operators/user-operator/${params.row.id}/1`}>
                    <Button variant="contained">View Details</Button>
                  </Link>
                </div>
              ),
            };
          }
          return column;
        });
        //  🔄 Use updatedColumns for rendering the DataGrid
        setCustomColumns(updatedColumnsUserOperators);
        break;
      default:
        break;
    }
  }, [columns, cntxt]);

  return (
    <div style={{ height: "auto", width: "100%" }}>
      <MuiGrid
        rows={rows}
        columns={customColumns}
        sx={{
          "& .MuiSvgIcon-root": {
            color: "white",
          },
          "& .MuiDataGrid-columnHeaderDraggableContainer": {
            flex: 0,
          },
          "& .MuiDataGrid-columnHeader": {
            border: "1px white solid",
            borderBottom: "none",
            borderTop: "none",
            color: "white",
            backgroundColor: BC_GOV_BACKGROUND_COLOR_BLUE,
            fontWeight: "bold",
            justifyContent: "center",
          },

          "& .MuiDataGrid-columnHeader:first-child": {
            borderLeft: "none",
          },
          "& .MuiDataGrid-columnHeader:last-child": {
            borderRight: "none",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold",
            whiteSpace: "pre-line",
            lineHeight: "normal",
            textAlign: "center",
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
          "& .MuiDataGrid-cell": {
            justifyContent: "center",
            textAlign: "center",
          },
        }}
        disableVirtualization
      />
    </div>
  );
};

export default DataGrid;
