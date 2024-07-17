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
} from "@mui/x-data-grid";
import Pagination from "@bciers/components/datagrid/Pagination";
import SortIcon from "@bciers/components/icons/SortIcon";
import styles from "@bciers/components/datagrid/styles";

interface Props {
  fetchPageData?: (params: { [key: string]: any }) => Promise<any>;
  columns: GridColDef[];
  columnGroupModel?: GridColumnGroupingModel;
  initialData: {
    rows: { [key: string]: any }[];
    row_count?: number;
  };
  paginationMode?: "client" | "server";
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

const PAGE_SIZE = 20;

const DataGrid: React.FC<Props> = ({
  columns,
  columnGroupModel,
  fetchPageData,
  paginationMode = "client",
  initialData,
}) => {
  const [rows, setRows] = useState(initialData.rows ?? []);
  const [rowCount, setRowCount] = useState(initialData.row_count ?? undefined);
  const [loading, setLoading] = useState(false);
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const searchParams = useSearchParams();
  const isRowsEmpty = rows.length === 0;

  useEffect(() => {
    setIsComponentMounted(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Don't fetch data if the component is not mounted
    // Since we will grab the first page using the server side props
    if (!isComponentMounted || !fetchPageData || loading) return;

    setLoading(true);
    const debouncedFetchData = debounce(async () => {
      const fetchData = async () => {
        const newParams = new URLSearchParams(searchParams);
        const params = Object.fromEntries(newParams.entries());

        // fetch data from server
        const pageData = await fetchPageData(params);
        setRows(pageData.rows);
        setRowCount(pageData.row_count);
      };

      fetchData().then(() => setLoading(false));
    }, 200);
    debouncedFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSortModelChange = (newSortModel: GridSortItem[]) => {
    if (!isComponentMounted) return;
    // window.location.pathname includes `/registration` unlike usePathname
    const pathName = window.location.pathname;
    const params = new URLSearchParams(searchParams);

    const sortField = newSortModel[0]?.field;

    if (sortField) {
      // Set the sort field and order in the URL
      params.set("sort_field", sortField);
      params.set("sort_order", newSortModel[0].sort === "asc" ? "asc" : "desc");
    } else {
      // Remove the sort field and order from the URL
      params.delete("sort_field");
      params.delete("sort_order");
    }

    // Update the URL with the new sort field and order
    // replace(`${pathname}?${params.toString()}`);
    // Shallow routing is not avilalble in nextjs app router so using window.history.replaceState
    window.history.replaceState({}, "", `${pathName}?${params.toString()}`);
  };

  const handlePaginationModelChange = (newPaginationModel: {
    page: number;
    pageSize: number;
  }) => {
    if (!isComponentMounted) return;
    // window.location.pathname includes `/registration` unlike usePathname
    const pathName = window.location.pathname;
    const params = new URLSearchParams(searchParams);
    const newPageNumber = newPaginationModel.page + 1;

    // Set the page and page size in the URL
    params.set("page", newPageNumber.toString());

    // Update the URL with the new page number
    // replace(`${pathname}?${params.toString()}`);
    // Shallow routing is not avilalble in nextjs app router so using window.history.replaceState
    window.history.replaceState({}, "", `${pathName}?${params.toString()}`);
  };

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
  const sx = useMemo(() => {
    return {
      ...styles,
      // Add dynamic styles here
      "& .MuiDataGrid-overlayWrapper": {
        height: isRowsEmpty && !loading ? "40vh" : "0",
        display: isRowsEmpty && !loading ? "block" : "none",
      },
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
        pagination
        pageSizeOptions={[PAGE_SIZE]}
        sortingMode={paginationMode}
        paginationMode={paginationMode}
        onPaginationModelChange={handlePaginationModelChange}
        paginationModel={paginationModel}
        onSortModelChange={handleSortModelChange}
        // Set the row height to "auto" so that the row height will adjust to the content
        getRowHeight={() => "auto"}
        slots={slots}
        sx={sx}
        disableVirtualization
      />
    </div>
  );
};

export default DataGrid;
