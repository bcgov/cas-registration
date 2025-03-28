import { GridColDef } from "@mui/x-data-grid";

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
      type: "string",
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
      field: "referenceNumber",
      headerName: "Reference Number",
      width: 201.2,
      type: "string",
    },
  ];
};

export default monetaryPaymentsColumns;
