import { actionHandler } from "@bciers/actions";

/**
 * Fetches compliance report version data for the Request Issuance workflow
 * @param complianceReportVersionId - The ID of the compliance report version to fetch
 * @returns The compliance report version data with issuance information
 */
export const getRequestIssuanceComplianceSummaryData = async (
  complianceReportVersionId?: string,
) => {
  if (complianceReportVersionId) {
    try {
      const data = await actionHandler(
        `compliance/compliance-report-versions/${complianceReportVersionId}/earned-credits`,
        "GET",
        "",
      );
      if (data?.error) {
        console.error(
          `Failed to fetch issuance compliance summary: ${data.error}`,
        );
      } else if (data && typeof data === "object") {
        return {
          operationId: data.id,
          reportingYear: data.reporting_year,
          emissionsAttributableForCompliance:
            data.emissions_attributable_for_compliance,
          emissionLimit: data.emission_limit,
          excessEmissions: data.excess_emissions,
          earnedCredits: data.earned_credits,
          issuanceStatus: data.issuance_status,
        };
      }
    } catch (error) {
      console.error("Error fetching issuance compliance summary:", error);
    }
  }
};
