import { GridColDef } from "@mui/x-data-grid";
import { formatMonetaryValue } from "@/compliance/src/app/utils/formatting";

const monetaryPaymentsColumns = (): GridColDef[] => {
  return [
    {
      field: "formatted_received_date",
      headerName: "Payment Received Date",
      width: 300,
      type: "string",
    },
    {
      field: "amount",
      headerName: "Payment Amount Applied",
      type: "string",
      width: 300,
      valueFormatter: (params) => formatMonetaryValue(Number(params.value)),
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
