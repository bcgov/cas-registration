import {
  GridColumnGroupingModel,
  GridColumnGroupHeaderParams,
} from "@mui/x-data-grid";
import createColumnGroup from "@bciers/components/datagrid/createColumnGrid";

const monetaryPaymentsGroupColumns = (
  SearchCell: (params: GridColumnGroupHeaderParams) => JSX.Element,
) => {
  const columnGroupModel = [
    createColumnGroup(
      "paymentReceivedDate",
      "Payment Received Date",
      SearchCell,
    ),
    createColumnGroup(
      "paymentAmountApplied",
      "Payment Amount Applied",
      SearchCell,
    ),
    createColumnGroup("paymentMethod", "Payment Method", SearchCell),
    createColumnGroup("transactionType", "Transaction Type", SearchCell),
    createColumnGroup("referenceNumber", "Reference Number", SearchCell),
  ] as GridColumnGroupingModel;

  return columnGroupModel;
};

export default monetaryPaymentsGroupColumns;
