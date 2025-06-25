import {
  GridColumnGroupingModel,
  GridColumnGroupHeaderParams,
} from "@mui/x-data-grid";
import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";

const monetaryPaymentsGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel = [
    createColumnGroup("received_date", "Payment Received Date", SearchCell),
    createColumnGroup("amount", "Payment Amount Applied", SearchCell),
    createColumnGroup("payment_method", "Payment Method", SearchCell),
    createColumnGroup("transaction_type", "Transaction Type", SearchCell),
    createColumnGroup("payment_object_id", "Receipt Number", SearchCell),
  ] as GridColumnGroupingModel;

  return columnGroupModel;
};

export default monetaryPaymentsGroupColumns;
