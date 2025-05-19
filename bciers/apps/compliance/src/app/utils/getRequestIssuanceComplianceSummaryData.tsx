export interface RequestIssuanceComplianceSummaryData {
  id: number;
  operation_name: string;
  reporting_year: number;
  earned_credits: number;
  issuance_status: string;
  emissions_attributable_for_compliance: number;
  emission_limit: number;
  excess_emissions: number;
}

/**
 * Fetches compliance report version data for the Request Issuance workflow
 * @param complianceReportVersionId - The ID of the compliance report version to fetch
 * @returns The compliance report version data with issuance information
 */
export const getRequestIssuanceComplianceSummaryData = async (
  complianceReportVersionId?: number,
) => {
  if (complianceReportVersionId) {
    try {
      const data = await actionHandler(
        `compliance/compliance-report-versions/${complianceReportVersionId}/issuance`,
        "GET",
        "",
      );

  //     if (data?.error) {
  //       console.error(
  //         `Failed to fetch issuance compliance summary: ${data.error}`,
  //       );
  //     } else if (data && typeof data === "object") {
  //       return data;
  //     }
  //   } catch (error) {
  //     console.error("Error fetching issuance compliance summary:", error);
  //   }
  // }

  return data;
};
