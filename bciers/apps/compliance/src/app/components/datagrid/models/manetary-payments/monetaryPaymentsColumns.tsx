import { GridColDef } from "@mui/x-data-grid";
import { formatMonetaryValue } from "@/compliance/src/app/utils/formatting";

const monetaryPaymentsColumns = (): GridColDef[] => {
  return [
    {
      field: "paymentReceivedDate",
      headerName: "Payment Received Date",
      width: 200,
      type: "string",
    },
    {
      field: "paymentAmountApplied",
      headerName: "Payment Amount Applied",
      type: "string",
      width: 200,
      valueFormatter: (params) => formatMonetaryValue(Number(params.value)),
    },
    {
      field: "paymentMethod",
      headerName: "Payment Method",
      width: 200,
      type: "string",
    },
    {
      field: "transactionType",
      headerName: "Transaction Type",
      width: 200,
      type: "string",
    },
    {
      field: "receiptNumber",
      headerName: "Receipt Number",
      type: "string",
      flex:1,
    },
  ];
};

export default monetaryPaymentsColumns;
