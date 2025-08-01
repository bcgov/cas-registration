import { GridColDef } from "@mui/x-data-grid";
import { formatMonetaryValue } from "@/compliance/src/app/utils/formatting";

const monetaryPaymentsColumns = (): GridColDef[] => {
  return [
    {
      field: "formatted_received_date",
      headerName: "Payment Received Date",
      width: 200,
      type: "string",
    },
    {
      field: "amount",
      headerName: "Payment Amount Applied",
      type: "string",
      width: 200,
      valueFormatter: (params) => formatMonetaryValue(Number(params.value)),
    },
    {
      field: "method",
      headerName: "Payment Method",
      width: 200,
      type: "string",
    },
    {
      field: "transaction_type",
      headerName: "Transaction Type",
      width: 200,
      type: "string",
    },
    {
      field: "receipt_number",
      headerName: "Receipt Number",
      type: "string",
      flex: 1,
    },
  ];
};

export default monetaryPaymentsColumns;
