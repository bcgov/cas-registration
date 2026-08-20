import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

/**
 * Invokes a column's renderCell in tests.
 *
 * GridColDef declares renderCell as optional, and tests only supply the subset
 * of GridRenderCellParams that the cell under test actually reads.
 */
const renderGridCell = (
  column: GridColDef,
  params: Partial<GridRenderCellParams>,
) => column.renderCell!(params as GridRenderCellParams);

export default renderGridCell;
