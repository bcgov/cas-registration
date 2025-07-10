import { actionHandler } from "@bciers/actions";
import { ObligationData, PaymentData } from "@/compliance/src/app/types";

export const getObligationData = async (
  complianceReportVersionId: string,
): Promise<ObligationData> => {
  const data = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/obligation`,
    "GET",
    "",
  );

  if (data?.error) {
    throw new Error(`Failed to fetch obligation data: ${data.error}`);
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid response format from obligation data endpoint");
  }

  return data as ObligationData;
};

export const getObligationPayments = async (
  complianceReportVersionId: string,
): Promise<PaymentData> => {
  const data = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/obligation/payments`,
    "GET",
    "",
  );

  if (data?.error) {
    throw new Error(`Failed to fetch obligation payments: ${data.error}`);
  }

  if (!data || typeof data !== "object") {
    throw new Error(
      "Invalid response format from obligation payments endpoint",
    );
  }

  return data as PaymentData;
};
