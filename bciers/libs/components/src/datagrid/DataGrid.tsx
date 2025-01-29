"use client";

import { useMemo, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import debounce from "lodash.debounce";
import {
  DataGrid as MuiGrid,
  GridColDef,
  GridColumnGroupingModel,
  GridSortDirection,
  GridSortItem,
  GridRowIdGetter,
} from "@mui/x-data-grid";
import Pagination from "@bciers/components/datagrid/Pagination";
import SortIcon from "@bciers/components/icons/SortIcon";
import styles from "@bciers/components/datagrid/styles";

interface Props {
  columns: GridColDef[];
  columnGroupModel?: GridColumnGroupingModel;
  disabled?: boolean; // Optional prop to disable sorting and filtering - was needed to prevent URL updates on page change
  fetchPageData?: (params: { [key: string]: any }) => Promise<any>;
  initialData: {
    rows: { [key: string]: any }[];
    row_count?: number;
  };
  paginationMode?: "client" | "server";
  sx?: { [key: string]: any };
  getRowId?: GridRowIdGetter<any> | undefined;
  pageSize?: number;
}

const AscendingIcon = () => {
  return <SortIcon topFill="grey" bottomFill="white" />;
};

const DescendingIcon = () => {
  return <SortIcon topFill="white" bottomFill="grey" />;
};

const slots = {
  columnSortedAscendingIcon: AscendingIcon,
  columnSortedDescendingIcon: DescendingIcon,
  columnUnsortedIcon: SortIcon,
  pagination: Pagination,
  noRowsOverlay: () => (
    <div className="flex items-center w-full h-full justify-center text-2xl">
      No records found
    </div>
  ),
};

const experimentalFeatures = {
  columnGrouping: true,
  ariaV7: true,
};

const DataGrid: React.FC<Props> = ({
  columns,
  columnGroupModel,
  disabled,
  fetchPageData,
  paginationMode = "client",
  initialData,
  getRowId,
  sx,
  pageSize,
}) => {
  const PAGE_SIZE = pageSize ? pageSize : 20;
  const [rows, setRows] = useState(initialData.rows ?? []);
  const [rowCount, setRowCount] = useState(initialData.row_count ?? undefined);
  const [loading, setLoading] = useState(false);
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const isRowsEmpty = !rows || rows.length === 0;
  const searchParams = useSearchParams();
  const [sortModel, setSortModel] = useState<GridSortItem[]>([]);
  const debouncedFetchData = debounce(async () => {
    const fetchData = async () => {
      const newParams = new URLSearchParams(searchParams);
      const params = Object.fromEntries(newParams.entries());

      // fetch data from server
      const pageData = fetchPageData && (await fetchPageData(params));
      if (pageData) {
        setRows(pageData.rows ?? []);
        setRowCount(pageData.row_count ?? 0);
      }
    };

    fetchData().then(() => setLoading(false));
    return () => debouncedFetchData.cancel();
  }, 200);

  useEffect(() => {
    setIsComponentMounted(true);

    // Cancel debounce on unmount
    return () => debouncedFetchData.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Don't fetch data if the component is not mounted
    // Since we will grab the first page using the server side props
    if (!isComponentMounted || !fetchPageData || disabled) return;
    setLoading(true);
    debouncedFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSortModelChange = useMemo(
    () => (newSortModel: GridSortItem[]) => {
      if (disabled) return;
      // window.location.pathname includes `/registration` unlike usePathname
      const pathName = window.location.pathname;
      const params = new URLSearchParams(searchParams);
      const isParamsEmpty =
        Object.keys(Object.fromEntries(params)).length === 0;
      const isSortFieldEmpty = !newSortModel[0]?.field;

      // Do not update the URL if the sort field is empty and the URL is already empty
      if (isParamsEmpty && isSortFieldEmpty) return;

      const sortField = newSortModel[0]?.field;

      if (sortField) {
        // Set the sort field and order in the URL
        params.set("sort_field", sortField);
        params.set(
          "sort_order",
          newSortModel[0].sort === "asc" ? "asc" : "desc",
        );
      } else {
        params.delete("sort_field");
        params.delete("sort_order");
      }

      setSortModel(newSortModel);

      // Update the URL with the new sort field and order
      // replace(`${pathname}?${params.toString()}`);
      // Shallow routing is not avilalble in nextjs app router so using window.history.replaceState
      window.history.replaceState({}, "", `${pathName}?${params.toString()}`);
    },
    [searchParams],
  );

  const handlePaginationModelChange = useMemo(
    () => (newPaginationModel: { page: number; pageSize: number }) => {
      if (disabled) return;
      // window.location.pathname includes `/registration` unlike usePathname
      const pathName = window.location.pathname;
      const params = new URLSearchParams(searchParams);
      const newPageNumber = newPaginationModel.page + 1;

      // Set the page and page size in the URL
      params.set("page", newPageNumber.toString());

      // Update the URL with the new page number
      // Shallow routing is not avilalble in nextjs app router so using window.history.replaceState
      window.history.replaceState({}, "", `${pathName}?${params.toString()}`);
    },
    [searchParams],
  );

  // Memoize initialState
  const initialState = useMemo(() => {
    return {
      pagination: { paginationModel: { pageSize: PAGE_SIZE } },
      sorting: {
        sortModel: [
          {
            field: searchParams.get("sort_field") ?? "created_at",
            sort:
              (searchParams.get("sort_order") as GridSortDirection) ?? "desc",
          },
        ],
      },
    };
  }, [searchParams]);

  // Memoize sx
  const gridStyles = useMemo(() => {
    return {
      ...styles,
      // Add dynamic styles here
      "& .MuiDataGrid-overlayWrapper": {
        height: isRowsEmpty && !loading ? "40vh" : "0",
        display: isRowsEmpty && !loading ? "block" : "none",
      },
      // Allow overriding styles with sx prop
      ...sx,
    };
  }, [isRowsEmpty, loading]);

  // Memoize paginationModel
  const paginationModel = useMemo(() => {
    return {
      pageSize: PAGE_SIZE,
      page: Number(searchParams.get("page") ?? 1) - 1,
    };
  }, [searchParams]);

  return (
    <div style={{ height: "auto", width: "100%" }}>
      <MuiGrid
        rows={rows}
        columns={columns}
        columnGroupingModel={columnGroupModel}
        loading={loading}
        rowCount={rowCount}
        showCellVerticalBorder
        experimentalFeatures={experimentalFeatures}
        disableColumnMenu
        initialState={initialState}
        getRowId={getRowId}
        pagination
        pageSizeOptions={[PAGE_SIZE]}
        sortingMode={paginationMode}
        paginationMode={paginationMode}
        onPaginationModelChange={handlePaginationModelChange}
        paginationModel={paginationModel}
        onSortModelChange={handleSortModelChange}
        sortModel={sortModel}
        // Set the row height to "auto" so that the row height will adjust to the content
        getRowHeight={() => "auto"}
        slots={slots}
        sx={gridStyles}
        disableVirtualization
      />
    </div>
  );
};

export default DataGrid;
