import { GridColDef } from "@mui/x-data-grid";
import { formatMonetaryValue } from "@/compliance/src/app/utils/formatting";

const monetaryPaymentsColumns = (): GridColDef[] => {
  return [
    {
      field: "paymentReceivedDate",
      headerName: "Payment Received Date",
      width: 201.2,
      type: "string",
    },
    {
      field: "paymentAmountApplied",
      headerName: "Payment Amount Applied",
      width: 201.2,
      type: "number",
      valueFormatter: (params) => formatMonetaryValue(Number(params.value)),
    },
    {
      field: "paymentMethod",
      headerName: "Payment Method",
      width: 201.2,
      type: "string",
    },
    {
      field: "transactionType",
      headerName: "Transaction Type",
      width: 201.2,
      type: "string",
    },
    {
      field: "receiptNumber",
      headerName: "Receipt Number",
      width: 201.2,
      type: "string",
    },
  ];
};

export default monetaryPaymentsColumns;
