import { GridColDef } from "@mui/x-data-grid";
import { formatMonetaryValue } from "@/compliance/src/app/utils/formatting";

const elicensingInvoiceColumns = (): GridColDef[] => {
  return [
    {
      field: "compliance_period",
      headerName: "Compliance Period",
      flex: 1,
    },
    {
      field: "operator_legal_name",
      headerName: "Operator Name",
      flex: 1,
    },
    {
      field: "operation_name",
      headerName: "Operation Name",
      flex: 1,
    },
    {
      field: "invoice_type",
      headerName: "Invoice Type",
      flex: 1,
    },
    {
      field: "invoice_number",
      headerName: "Invoice Number",
      flex: 1,
    },
    {
      field: "invoice_total",
      headerName: "Invoice Total",
      flex: 1,
      valueFormatter: (params) => formatMonetaryValue(Number(params.value)),
    },
    {
      field: "total_adjustments",
      headerName: "Total Adjustments",
      flex: 1,
      valueFormatter: (params) => formatMonetaryValue(Number(params.value)),
    },
    {
      field: "total_payments",
      headerName: "Total Payments",
      flex: 1,
      valueFormatter: (params) => formatMonetaryValue(Number(params.value)),
    },
    {
      field: "outstanding_balance",
      headerName: "Outstanding Balance",
      flex: 1,
      valueFormatter: (params) => formatMonetaryValue(Number(params.value)),
    },
  ];
};

export default elicensingInvoiceColumns;
