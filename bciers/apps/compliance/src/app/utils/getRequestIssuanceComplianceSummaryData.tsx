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
 * Fetches compliance summary data for the Request Issuance workflow
 * @param complianceSummaryId - The ID of the compliance summary to fetch
 * @returns The compliance summary data with issuance information
 */
export const getRequestIssuanceComplianceSummaryData = async (
  complianceSummaryId?: number,
) => {
  const data: RequestIssuanceComplianceSummaryData = {
    operation_name: "Sample Operation",
    reporting_year: 2023,
    earned_credits: 100,
    issuance_status: "Issuance not requested",
    id: complianceSummaryId || 0,
    emissions_attributable_for_compliance: 900,
    emission_limit: 1000,
    excess_emissions: -100,
  };

  // To be handled in issue #117

  // if (complianceSummaryId) {
  //   try {
  //     const data = await actionHandler(
  //       `compliance/summaries/${complianceSummaryId}/issuance`,
  //       "GET",
  //       "",
  //     );

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
