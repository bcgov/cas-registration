import {
  GridColumnGroupHeaderParams,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";

const elicensingInvoiceGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel: GridColumnGroupingModel = [
    createColumnGroup("compliance_period", "Compliance Period", SearchCell),
    createColumnGroup("operator_legal_name", "Operator Name", SearchCell),
    createColumnGroup("operation_name", "Operation Name", SearchCell),
    createColumnGroup("invoice_type", "Invoice Type", SearchCell),
    createColumnGroup("invoice_number", "Invoice Number", SearchCell),
    createColumnGroup("invoice_total", "Invoice Total", SearchCell),
    createColumnGroup("total_adjustments", "Total Adjustments", SearchCell),
    createColumnGroup("total_payments", "Total Payments", SearchCell),
    createColumnGroup("outstanding_balance", "Outstanding Balance", SearchCell),
  ];

  return columnGroupModel;
};

export default elicensingInvoiceGroupColumns;
