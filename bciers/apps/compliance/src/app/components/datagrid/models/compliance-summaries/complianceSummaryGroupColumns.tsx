import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";
import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";

const complianceSummaryGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
  isAllowedCas: boolean,
): GridColumnGroupingModel => {
  const groups: GridColumnGroupingModel = [
    createColumnGroup("reporting_year", "Compliance Period", SearchCell),
    // "operator_name" is inserted conditionally
    createColumnGroup("operation_name", "Operation Name", SearchCell),
    createColumnGroup(
      "excess_emissions",
      "Excess Emissions as of Invoice Date",
      EmptyGroupCell,
    ),
    createColumnGroup(
      "outstanding_balance_tco2e",
      "Outstanding Balance",
      EmptyGroupCell,
    ),
    createColumnGroup("display_status", "Compliance Status", SearchCell),
    createColumnGroup("penalty_status", "Penalty Status", SearchCell),
    createColumnGroup("obligation_id", "Obligation ID", SearchCell),
    createColumnGroup("actions", "Actions", EmptyGroupCell),
  ];

  if (isAllowedCas) {
    // match the flat columns: insert Operator Name after Compliance Period
    groups.splice(
      1,
      0,
      createColumnGroup("operator_name", "Operator Name", SearchCell),
    );
  }

  return groups;
};

export default complianceSummaryGroupColumns;
