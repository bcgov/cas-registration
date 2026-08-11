"use client";

import React, {
  useMemo,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
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
import type { GridRowParams } from "@mui/x-data-grid";
import Pagination from "@bciers/components/datagrid/Pagination";
import {
  getLiveSearchParams,
  replaceUrlParams,
} from "@bciers/components/datagrid/replaceUrlParams";
import SortIcon from "@bciers/components/icons/SortIcon";
import styles from "@bciers/components/datagrid/styles";
import { Dict } from "@bciers/types/dictionary";

interface Props {
  columns: GridColDef[];
  columnGroupModel?: GridColumnGroupingModel;
  disabled?: boolean; // Optional prop to disable sorting and filtering - was needed to prevent URL updates on page change
  fetchPageData?: (params: Dict) => Promise<any>;
  initialData: {
    rows: Dict[] | undefined;
    row_count?: number;
  };
  paginationMode?: "client" | "server";
  sx?: Dict;
  getRowId?: GridRowIdGetter<any> | undefined;
  pageSize?: number;
  rowSelection?: boolean;
  noDataMessage?: ReactNode | string;
  hideFooter?: boolean;
  getRowClassName?: (params: GridRowParams) => string;
}

const AscendingIcon = () => {
  return <SortIcon topFill="grey" bottomFill="white" />;
};

const DescendingIcon = () => {
  return <SortIcon topFill="white" bottomFill="grey" />;
};

const experimentalFeatures = {
  columnGrouping: true,
  ariaV7: true,
};

// The sort the grid falls back to when the URL doesn't specify one
const DEFAULT_SORT_FIELD = "created_at";
const DEFAULT_SORT_ORDER: GridSortDirection = "desc";

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
  rowSelection,
  noDataMessage,
  hideFooter = false,
  getRowClassName: rowClassName,
}) => {
  const PAGE_SIZE = pageSize ? pageSize : 20;
  const [rows, setRows] = useState(initialData.rows ?? []);
  const [rowCount, setRowCount] = useState(initialData.row_count ?? undefined);
  const [loading, setLoading] = useState(false);
  const isRowsEmpty = !rows || rows.length === 0;
  const searchParams = useSearchParams();
  const [sortModel, setSortModel] = useState<GridSortItem[]>([]);

  // Track if this is the initial mount - skip fetch since server already provided initialData
  const isInitialMountRef = useRef(true);
  // Track previous searchParams string to avoid fetching when object reference changes but values are the same
  const prevSearchParamsRef = useRef<string>(searchParams.toString());
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

  const slots = {
    columnSortedAscendingIcon: AscendingIcon,
    columnSortedDescendingIcon: DescendingIcon,
    columnUnsortedIcon: SortIcon,
    pagination: Pagination,
    noRowsOverlay: () => (
      <div className="flex items-center w-full h-full justify-center text-2xl">
        {noDataMessage || "No records found"}
      </div>
    ),
  };
  useEffect(() => {
    // Skip the initial mount - server already fetched data as initialData
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevSearchParamsRef.current = searchParams.toString();
      return;
    }

    // Only fetch if searchParams actually changed (compare strings, not object references)
    const currentParamsString = searchParams.toString();
    if (
      prevSearchParamsRef.current === currentParamsString ||
      !fetchPageData ||
      disabled
    ) {
      return;
    }

    prevSearchParamsRef.current = currentParamsString;
    setLoading(true);
    debouncedFetchData();

    // Cancel debounce on unmount
    return () => debouncedFetchData.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, fetchPageData, disabled]);

  const handleSortModelChange = useMemo(
    () => (newSortModel: GridSortItem[]) => {
      if (disabled) return;

      const sortField = newSortModel[0]?.field;
      const sortOrder = newSortModel[0]?.sort === "asc" ? "asc" : "desc";

      // Keep the controlled model in step with the grid even when the URL doesn't
      // need touching, so a sort carried in on the URL still renders as sorted.
      setSortModel(newSortModel);

      // MUI reports the sort model back while it initialises, before the user has
      // done anything. Ignore anything that already matches the URL — including the
      // implicit default the grid falls back to when sort_field is absent — so
      // mounting the grid never writes history.
      const liveParams = getLiveSearchParams();
      const matchesUrl = sortField
        ? sortField === (liveParams.get("sort_field") ?? DEFAULT_SORT_FIELD) &&
          sortOrder === (liveParams.get("sort_order") ?? DEFAULT_SORT_ORDER)
        : !liveParams.has("sort_field") && !liveParams.has("sort_order");

      if (matchesUrl) return;

      const params = new URLSearchParams(searchParams);

      if (sortField) {
        // Set the sort field and order in the URL
        params.set("sort_field", sortField);
        params.set("sort_order", sortOrder);
      } else {
        params.delete("sort_field");
        params.delete("sort_order");
      }

      replaceUrlParams(params);
    },
    [searchParams, disabled],
  );

  const handlePaginationModelChange = useMemo(
    () => (newPaginationModel: { page: number; pageSize: number }) => {
      if (disabled) return;

      const newPageNumber = newPaginationModel.page + 1;

      // As above: the grid reports its initial page while setting itself up
      const liveParams = getLiveSearchParams();
      if (newPageNumber === Number(liveParams.get("page") ?? 1)) return;

      const params = new URLSearchParams(searchParams);

      // Set the page and page size in the URL
      params.set("page", newPageNumber.toString());

      replaceUrlParams(params);
    },
    [searchParams, disabled],
  );

  // Memoize initialState
  const initialState = useMemo(() => {
    return {
      pagination: { paginationModel: { pageSize: PAGE_SIZE } },
      sorting: {
        sortModel: [
          {
            field: searchParams.get("sort_field") ?? DEFAULT_SORT_FIELD,
            sort:
              (searchParams.get("sort_order") as GridSortDirection) ??
              DEFAULT_SORT_ORDER,
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
      // Row class styling (works with getRowClassName returning "row--highlight")
      "& .MuiDataGrid-row.row--highlight": {
        backgroundColor: "rgba(255,193,7,0.12)",
      },
      "& .MuiDataGrid-row.row--highlight:hover": {
        backgroundColor: "rgba(255,193,7,0.18)",
      },
      "& .MuiDataGrid-row.row--highlight.Mui-selected": {
        backgroundColor: "rgba(255,193,7,0.22)",
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
        rowSelection={rowSelection}
        hideFooter={hideFooter}
        getRowClassName={rowClassName}
      />
    </div>
  );
};

export default DataGrid;
