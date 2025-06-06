export interface DirectorReviewData {
  id: string;
  operation_name: string;
  reporting_year: number;
  earnedCredits: number;
  issuanceStatus: string;
  bccrTradingName: string;
  bccrHoldingAccountId: string;
  analyst_comment: string;
  attachment?: {
    id: string;
    file_name: string;
  };
  analyst_recommendation?: string;
  director_comment?: string;
}

/**
 * Retrieves data for the internal review by director page
 *
 * This function provides the necessary data for the director review process,
 * including operation details, earned credits, and analyst review information.
 *
 * @param complianceSummaryId - ID of the compliance summary being reviewed
 * @returns DirectorReviewData with all fields needed for the form
 */
export const getDirectorReviewData = (complianceSummaryId: string) => {
  const data: DirectorReviewData = {
    id: complianceSummaryId,
    operation_name: "Red Operation",
    reporting_year: 2023,
    earnedCredits: 100,
    issuanceStatus: "Issuance requested, awaiting approval",
    bccrTradingName: "Colour Co.",
    bccrHoldingAccountId: "437248194316283",
    analyst_comment: "Lorem ipsum",
    attachment: {
      id: "attachment-123",
      file_name: "document.pdf",
    },
    analyst_recommendation: "ready_to_approve",
    director_comment: "",
  };

  // Mock data for development and testing purposes
  //
  // TBD: API implementation for fetching this data from the backend
  // The actual API endpoint and data structure will be determined
  // during backend implementation

  return data;
};
