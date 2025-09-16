import { GridRenderCellParams } from "@mui/x-data-grid";
import InvoiceCellFactory from "@bciers/components/datagrid/cells/InvoiceCellFactory";
import { ComplianceSummary } from "@/compliance/src/app/types";
import {
  ComplianceInvoiceTypes,
  ComplianceSummaryStatus,
  IssuanceStatus,
} from "@bciers/utils/src/enums";
import { Button } from "@mui/material";
import generateInvoice from "../../utils/generateInvoice";

interface InvoiceCellProps extends GridRenderCellParams<ComplianceSummary> {
  isAllowedCas?: boolean;
}

function getInvoiceCellConfig(row: ComplianceSummary, isAllowedCas?: boolean) {
  const {
    obligation_id: obligationId,
    status,
    issuance_status: issuanceStatus,
    id,
    compliance_report_version_id,
    invoice_type,
  } = row;

  const basePath = `/compliance-summaries/${id}`;

  // Default
  return {
    cellText: "View Details",
    basePath: `${basePath}/review-summary`,
  };
}
const InvoiceCell = (params: InvoiceCellProps) => {
  // console.log("params", params.row);
  // const { cellText, basePath } = getInvoiceCellConfig(
  //   params.row,
  //   params.invoiceType,
  // );
  console.log("params", params);
  const invoiceType =
    params.invoice_type === "Automatic overdue penalty"
      ? ComplianceInvoiceTypes.AUTOMATIC_OVERDUE_PENALTY
      : ComplianceInvoiceTypes.OBLIGATION;
  const cell = (params: GridRenderCellParams) => {
    return (
      <button
        className="action-cell-text"
        aria-label="Cancel Access Request"
        onClick={() =>
          generateInvoice(
            params.row.compliance_report_version_id,
            params.row.invoice_type,
          )
        }
      >
        {params.row.invoice_number}
      </button>
    );
  };

  return cell(params);
};

export default InvoiceCell;
