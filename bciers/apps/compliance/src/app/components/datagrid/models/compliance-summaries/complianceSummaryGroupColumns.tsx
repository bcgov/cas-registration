import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";
import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";

const complianceSummaryGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel = [
    createColumnGroup("reporting_year", "Compliance Period", SearchCell),
    createColumnGroup("operator_name", "Operator Name", SearchCell),
    createColumnGroup("operation_name", "Operation Name", SearchCell),
    createColumnGroup("excess_emissions", "Excess Emissions", SearchCell),
    createColumnGroup(
      "outstanding_balance_tco2e",
      "Outstanding Balance",
      SearchCell,
    ),
    createColumnGroup("status", "Compliance Status", SearchCell),
    createColumnGroup("penalty_status", "Penalty Status", SearchCell),
    createColumnGroup("obligation_id", "Obligation ID", SearchCell),
    createColumnGroup("actions", "Actions", EmptyGroupCell),
  ] as GridColumnGroupingModel;

  return columnGroupModel;
};

export default complianceSummaryGroupColumns;
