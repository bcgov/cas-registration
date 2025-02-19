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
    createColumnGroup("reportingYear", "Reporting Year", SearchCell),
    createColumnGroup("operationName", "Operation Name", SearchCell),
    createColumnGroup("excessEmissions", "Excess Emissions", SearchCell),
    createColumnGroup("outstandingBalance", "Outstanding Balance", SearchCell),
    createColumnGroup("complianceStatus", "Compliance Status", SearchCell),
    createColumnGroup("penaltyStatus", "Penalty Status", SearchCell),
    createColumnGroup("obligationId", "Obligation ID", SearchCell),
    createColumnGroup("actions", "Actions", EmptyGroupCell),
  ] as GridColumnGroupingModel;

  return columnGroupModel;
};

export default complianceSummaryGroupColumns; 
