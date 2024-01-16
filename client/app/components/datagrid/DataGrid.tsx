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

interface SortIconProps {
  topFill?: string;
  bottomFill?: string;
}

const SortIcon = ({ topFill, bottomFill }: SortIconProps) => {
  return (
    <svg
      width="10"
      height="15"
      viewBox="0 0 10 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.32714 5.86914L0.672861 5.86914C0.0741596 5.86914 -0.225192 5.12087 0.198608 4.68235L4.52407 0.203175C4.78642 -0.0682907 5.21358 -0.0682907 5.47593 0.203175L9.80139 4.68235C10.2252 5.12087 9.92584 5.86914 9.32714 5.86914Z"
        fill={topFill || "white"}
      />
      <path
        d="M0.672861 9.13086H9.32714C9.92584 9.13086 10.2252 9.87913 9.80139 10.3176L5.47593 14.7968C5.21358 15.0683 4.78642 15.0683 4.52407 14.7968L0.198608 10.3176C-0.225193 9.87913 0.0741586 9.13086 0.672861 9.13086Z"
        fill={bottomFill || "white"}
      />
    </svg>
  );
};

const AscendingIcon = () => {
  return <SortIcon topFill="grey" bottomFill="white" />;
};

const DescendingIcon = () => {
  return <SortIcon topFill="white" bottomFill="grey" />;
};

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
                    <Button variant="contained" className="text-bc-links-color">
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
                  <Link
                    className="no-underline text-bc-link-blue"
                    href={`operators/user-operator/${params.row.id}/1`}
                  >
                    View Details
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
        showCellVerticalBorder
        components={{
          ColumnSortedAscendingIcon: AscendingIcon,
          ColumnSortedDescendingIcon: DescendingIcon,
          ColumnUnsortedIcon: SortIcon,
        }}
        sx={{
          "& .MuiSvgIcon-root": {
            color: "white",
          },
          "& .MuiDataGrid-columnHeaderDraggableContainer": {
            minWidth: "100%",
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
          "& .MuiDataGrid-columnHeaderTitleContainer": {
            justifyContent: "space-between",
          },
          "& .MuiDataGrid-columnHeaderTitleContainerContent": {
            flex: 1,
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold",
            whiteSpace: "pre-line",
            lineHeight: "normal",
            textAlign: "center",
            width: "100%",
            minWidth: "100%",
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
          "& .MuiDataGrid-cell": {
            justifyContent: "center",
            textAlign: "center",
          },
          ".MuiDataGrid-iconButtonContainer": {
            visibility: "visible !important",
            minWidth: "20px",
          },
          "& .MuiDataGrid-sortIcon": {
            opacity: "inherit !important",
          },
          // This hides the 3 dots menu that had additional options for each row
          // We may want to renable this menu though it's not in the design
          ".MuiDataGrid-menuIcon": {
            display: "none",
          },
        }}
        disableVirtualization
      />
    </div>
  );
};

export default DataGrid;
