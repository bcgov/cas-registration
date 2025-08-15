import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";
import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";
import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";

const pastReportsGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel = [
    createColumnGroup("reporting_year", "Reporting Year", SearchCell),
    createColumnGroup("operation_name", "Operation", SearchCell),
    createColumnGroup(
      "report_updated_at",
      "Date of submission",
      EmptyGroupCell,
    ),
    createColumnGroup("report_submitted_by", "Submitted by", EmptyGroupCell),
    createColumnGroup("report_status", "Status", SearchCell),
    createColumnGroup("action", "Action", EmptyGroupCell),
  ] as GridColumnGroupingModel;
  return columnGroupModel;
};

export default pastReportsGroupColumns;
