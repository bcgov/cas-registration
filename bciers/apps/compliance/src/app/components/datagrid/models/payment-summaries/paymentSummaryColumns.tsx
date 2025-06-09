import { GridColDef } from "@mui/x-data-grid";
import { formatMonetaryValue } from "@/compliance/src/app/utils/formatting";

const complianceSummaryColumns = (): GridColDef[] => {
  return [
    {
      field: "compliance_period",
      headerName: "Compliance Period",
      width: 150,
    },
    {
      field: "operation_name",
      headerName: "Operation Name",
      flex: 1,
    },
    {
      field: "payment_towards",
      headerName: "Payment Towards",
      width: 200,
    },
    {
      field: "invoice_number",
      headerName: "Invoice Number",
      width: 200,
    },
    {
      field: "payment_amount",
      headerName: "Payment Amount Applied",
      width: 200,
      valueFormatter: (params) => formatMonetaryValue(Number(params.value)),
    },
    {
      field: "outstanding_balance",
      headerName: "Outstanding Balance",
      width: 200,
      valueFormatter: (params) => formatMonetaryValue(Number(params.value)),
    },
  ];
};

export default complianceSummaryColumns;
