import { actionHandler } from "@bciers/actions";
import { Invoice } from "@/compliance/src/app/types";

const getInvoiceByComplianceReportVersionId = async (
  complianceReportVersionId: string,
): Promise<Invoice> => {
  const response: Invoice = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/invoice`,
    "GET",
    "",
  );
  return response;
};

export default getInvoiceByComplianceReportVersionId;
