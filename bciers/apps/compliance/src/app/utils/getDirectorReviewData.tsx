import { DirectorReviewData } from "@/compliance/src/app/types";
import { IssuanceStatus } from "@bciers/utils/src/enums";

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
    reporting_year: 2023,
    earned_credits_amount: 100,
    issuance_status: IssuanceStatus.APPROVED,
    bccr_trading_name: "Colour Co.",
    holding_account_id: "437248194316283",
    analyst_comment: "Lorem ipsum",
    analyst_recommendation: "ready_to_approve",
    director_comment: "",
  };

  // Mock data for development and testing purposes
  //
  // TBD: API implementation for fetching this data from the backend (Ticket #166)
  // The actual API endpoint and data structure will be determined
  // during backend implementation

  return data;
};
