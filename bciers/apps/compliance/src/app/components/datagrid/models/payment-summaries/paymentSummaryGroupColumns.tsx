import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";

const complianceSummaryGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel = [
    createColumnGroup("reporting_year", "Compliance Period", SearchCell),
    createColumnGroup("operation_name", "Operation Name", SearchCell),
    createColumnGroup("payment_toward", "Payment Towards", SearchCell),
    createColumnGroup("invoice_number", "Invoice Number", SearchCell),
    createColumnGroup("payment", "Payment Amount Applied", SearchCell),
    createColumnGroup("outstanding_balance", "Outstanding Balance", SearchCell),
  ] as GridColumnGroupingModel;

  return columnGroupModel;
};

export default complianceSummaryGroupColumns;
