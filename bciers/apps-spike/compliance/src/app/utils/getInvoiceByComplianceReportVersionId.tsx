import { actionHandler } from "@bciers/actions";
import { Invoice } from "@/compliance/src/app/types";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { ComplianceInvoiceTypes } from "@bciers/utils/src/enums";

const getInvoiceByComplianceReportVersionId = async (
  complianceReportVersionId: number,
  invoiceType?: ComplianceInvoiceTypes,
): Promise<Invoice> => {
  const queryParams = invoiceType
    ? buildQueryParams({ invoice_type: invoiceType })
    : "";
  const response: Invoice = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/invoice${queryParams}`,
    "GET",
    "",
  );
  return response;
};

export default getInvoiceByComplianceReportVersionId;
