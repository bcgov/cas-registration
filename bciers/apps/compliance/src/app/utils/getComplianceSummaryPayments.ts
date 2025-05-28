import { actionHandler } from "@bciers/actions";
import { PaymentsData } from "@/compliance/src/app/types";

export async function getComplianceSummaryPayments(
  complianceReportVersionId: string,
): Promise<PaymentsData> {
  try {
    const data = await actionHandler(
      `compliance/compliance-report-versions/${complianceReportVersionId}/payments`,
      "GET",
      "",
    );

    if (data?.error) {
      throw new Error(
        `Failed to fetch compliance summary payments: ${data.error}`,
      );
    }

    if (!data || typeof data !== "object" || !Array.isArray(data.rows)) {
      throw new Error(
        "Invalid response format from compliance summary payments endpoint",
      );
    }

    return {
      rows: data.rows,
      row_count: data.row_count || 0,
    };
  } catch (error) {
    console.error("Error fetching compliance summary payments:", error);
    return {
      rows: [],
      row_count: 0,
    };
  }
}
