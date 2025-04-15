import { actionHandler } from "@bciers/actions";

/**
 * Fetches compliance summary data for the Request Issuance workflow
 * @param complianceSummaryId - The ID of the compliance summary to fetch
 * @returns The compliance summary data with issuance information
 */
export const getRequestIssuanceComplianceSummaryData = async (
  complianceSummaryId?: string,
) => {
  if (complianceSummaryId) {
    try {
      const data = await actionHandler(
        `compliance/summaries/${complianceSummaryId}/issuance`,
        "GET",
        "",
      );

      if (data?.error) {
        console.error(
          `Failed to fetch issuance compliance summary: ${data.error}`,
        );
      } else if (data && typeof data === "object") {
        return data;
      }
    } catch (error) {
      console.error("Error fetching issuance compliance summary:", error);
    }
  }
};
