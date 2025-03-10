import { GridRenderCellParams } from "@mui/x-data-grid";

const OutstandingBalanceCell = (params: GridRenderCellParams) => {
  const excessEmissions: number = params.row.excess_emissions;
  const cellValue: number = excessEmissions > 0 ? excessEmissions : 0;
  const cellText: string = `${cellValue} tCO2e`;

  return <>{cellText}</>;
};

export default OutstandingBalanceCell;
