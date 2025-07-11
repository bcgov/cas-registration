import { GridColDef } from "@mui/x-data-grid";
import { formatMonetaryValue } from "@/compliance/src/app/utils/formatting";

const monetaryPaymentsColumns = (): GridColDef[] => {
  return [
    {
      field: "received_date",
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
      field: "payment_method",
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
      field: "payment_object_id",
      headerName: "Receipt Number",
      type: "string",
      flex: 1,
    },
  ];
};

export default monetaryPaymentsColumns;
