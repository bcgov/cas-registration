import EmptyGroupCell from "@bciers/components/datagrid/cells/EmptyGroupCell";
import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";
import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";

const annualReportGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel = [
    createColumnGroup("operation_name", "Operation", SearchCell),
    createColumnGroup("report_version_id", "Report Version ID", SearchCell),
    createColumnGroup("report_updated_at", "Date of submission", SearchCell),

    createColumnGroup("report", "Report", EmptyGroupCell),
    createColumnGroup("history", "Report History", EmptyGroupCell),
  ] as GridColumnGroupingModel;
  return columnGroupModel;
};

export default annualReportGroupColumns;
