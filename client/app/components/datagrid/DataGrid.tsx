"use client";
import { useEffect, useState } from "react";

import {
  DataGrid as MuiGrid,
  GridRowsProp,
  GridColDef,
  GridSortItem,
} from "@mui/x-data-grid";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@/app/styles/colors";
import Pagination from "@/app/components/datagrid/Pagination";

interface Props {
  fetchPageData?: (
    page: number,
    sortField?: string,
    sortOrder?: string,
  ) => Promise<any>;
  rows: GridRowsProp;
  rowCount?: number;
  columns: GridColDef[];
  paginationMode?: "client" | "server";
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

const PAGE_SIZE = 20;

const DataGrid: React.FC<Props> = ({
  columns,
  fetchPageData,
  paginationMode = "client",
  rows: initialRows,
  rowCount,
}) => {
  const [rows, setRows] = useState(initialRows ?? []);
  const [loading, setLoading] = useState(false);
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [sortModel, setSortModel] = useState([] as GridSortItem[]);

  useEffect(() => {
    setIsComponentMounted(true);
  }, []);

  useEffect(() => {
    const sortModelField = sortModel[0]?.field ?? "created_at";
    const sortModelOrder = sortModel[0]?.sort ?? "desc";

    // Don't fetch data if the component is not mounted
    // Since we will grab the first page using the server side props
    if (!isComponentMounted || !fetchPageData) return;
    setLoading(true);
    const fetchData = async () => {
      // fetch data from server
      const pageData = await fetchPageData(
        paginationModel.page + 1,
        sortModelField,
        sortModelOrder,
      );
      setRows(pageData);
    };

    fetchData().then(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, sortModel]);

  return (
    <div style={{ height: "auto", width: "100%" }}>
      <MuiGrid
        data-testid="grid-root"
        rows={rows}
        columns={columns}
        loading={loading}
        rowCount={rowCount}
        showCellVerticalBorder
        initialState={{
          pagination: { paginationModel: { pageSize: PAGE_SIZE } },
        }}
        pagination
        pageSizeOptions={[PAGE_SIZE]}
        sortingMode={paginationMode}
        paginationMode={paginationMode}
        onPaginationModelChange={setPaginationModel}
        onSortModelChange={setSortModel}
        // Set the row height to "auto" so that the row height will adjust to the content
        getRowHeight={() => "auto"}
        slots={{
          columnSortedAscendingIcon: AscendingIcon,
          columnSortedDescendingIcon: DescendingIcon,
          columnUnsortedIcon: SortIcon,
          pagination: Pagination,
        }}
        sx={{
          "& .MuiDataGrid-columnHeaderDraggableContainer": {
            minWidth: "100%",
          },
          "& .MuiDataGrid-row": {
            // Couldn't find a way to set minHeight without using !important
            // This was needed to use getRowHeight={() => "auto"} prop to break long text into multiple lines
            minHeight: "60px!important",
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
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: BC_GOV_BACKGROUND_COLOR_BLUE,
          },
          "& .MuiDataGrid-columnHeader:first-child": {
            borderLeft: "none",
          },
          "& .MuiDataGrid-columnHeader:last-child": {
            borderRight: "none",
          },
          "& .MuiDataGrid-columnHeaderTitleContainer": {
            justifyContent: "space-between",
            "& .MuiSvgIcon-root": {
              // Make the sort icon white in the title containers
              color: "white",
            },
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
            whiteSpace: "pre-line",
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
