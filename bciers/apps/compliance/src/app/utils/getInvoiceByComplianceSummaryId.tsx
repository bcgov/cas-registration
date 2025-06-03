import { actionHandler } from "@bciers/actions";

interface Invoice {
  invoiceNumber: string;
}

const getInvoiceByComplianceSummaryId = async (
  complianceSummaryId: string,
): Promise<Invoice> => {
  const response: Invoice = await actionHandler(
    `compliance/invoice/${complianceSummaryId}`,
    "GET",
    "",
  );
  return response;
};

export default getInvoiceByComplianceSummaryId;
