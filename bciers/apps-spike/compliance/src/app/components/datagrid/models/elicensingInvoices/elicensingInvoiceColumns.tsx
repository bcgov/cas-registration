import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { formatMonetaryValue } from "@/compliance/src/app/utils/formatting";
import { ComplianceInvoiceTypes } from "@bciers/utils/src/enums";
import generateInvoice from "@/compliance/src/app/utils/generateInvoice";
import Link from "@mui/material/Link";

export function formatInvoiceType(value?: string) {
  if (!value) return "";

  return value
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const elicensingInvoiceColumns = (isInternalUser: boolean): GridColDef[] => {
  return [
    {
      field: "compliance_period",
      headerName: "Compliance Period",
      flex: 1,
    },
    ...(isInternalUser
      ? [
          {
            field: "operator_legal_name",
            headerName: "Operator Name",
            flex: 1,
          },
        ]
      : []),

    {
      field: "operation_name",
      headerName: "Operation Name",
      minWidth: 160,
      flex: 1,
    },
    {
      field: "invoice_type",
      headerName: "Invoice Type",
      flex: 1,
      valueFormatter: (params) => formatInvoiceType(params.value),
    },
    {
      field: "invoice_number",
      headerName: "Invoice Number",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        const complianceReportVersionId =
          params.row.compliance_report_version_id;

        const invoiceType = params.row.invoice_type as ComplianceInvoiceTypes;

        return (
          <Link
            component="button"
            underline="hover"
            onClick={() =>
              generateInvoice(complianceReportVersionId, invoiceType)
            }
          >
            {params.value}
          </Link>
        );
      },
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
      field: "invoice_interest_balance",
      headerName: "FAA Interest",
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
