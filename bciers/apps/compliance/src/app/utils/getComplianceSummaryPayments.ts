import { actionHandler } from "@bciers/actions";
import { PaymentsData } from "../types/payments";

export async function getComplianceSummaryPayments(
  complianceSummaryId: number,
): Promise<PaymentsData> {
  try {
    const data = await actionHandler(
      `compliance/summaries/${complianceSummaryId}/payments`,
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
