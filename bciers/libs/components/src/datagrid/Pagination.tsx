import {
  gridPageSizeSelector,
  useGridApiContext,
  useGridSelector,
  gridFilteredTopLevelRowCountSelector,
  useGridRootProps,
} from "@mui/x-data-grid";
import MuiPagination from "@mui/material/Pagination";
import { TablePaginationProps } from "@mui/material/TablePagination";

const getPageCount = (rowCount: number, pageSize: number): number => {
  if (pageSize > 0 && rowCount > 0) {
    return Math.ceil(rowCount / pageSize);
  }

  return 0;
};

const Pagination = ({
  page = 0,
  onPageChange,
  className,
}: Pick<TablePaginationProps, "page" | "onPageChange" | "className">) => {
  const apiRef = useGridApiContext();
  const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
  const visibleTopLevelRowCount = useGridSelector(
    apiRef,
    gridFilteredTopLevelRowCountSelector,
  );
  const rootProps = useGridRootProps();
  const pageCount = getPageCount(
    rootProps.rowCount ?? visibleTopLevelRowCount,
    pageSize,
  );

  return (
    <MuiPagination
      // MUI renders a <nav aria-label="pagination navigation">, so a page with two grids has duplicate landmarks
      // Render a plain div instead and drop the label, which a div can't carry
      {...({ as: "div" } as object)}
      aria-label={undefined}
      color="primary"
      className={className}
      count={pageCount}
      page={page + 1}
      onChange={(event, newPage) => {
        onPageChange(event as any, newPage - 1);
      }}
    />
  );
};

export default Pagination;
