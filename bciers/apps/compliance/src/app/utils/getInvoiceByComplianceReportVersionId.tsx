import { actionHandler } from "@bciers/actions";

interface Invoice {
  invoiceNumber: string;
}

const getInvoiceByComplianceReportVersionId = async (
  complianceReportVersionId: string,
): Promise<Invoice> => {
  const response: Invoice = await actionHandler(
    `compliance/invoice/${complianceReportVersionId}`,
    "GET",
    "",
  );
  return response;
};

export default getInvoiceByComplianceReportVersionId;
