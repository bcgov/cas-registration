import { formatDate } from "@reporting/src/app/utils/formatDate";
import { CreditsIssuanceRequestData } from "@/compliance/src/app/types";
import { IssuanceStatus } from "@bciers/utils/src/enums";

/**
 * Retrieves data for the internal review credits issuance request form
 *
 * This function provides the necessary data for the analyst review process,
 * including operation details, earned credits, and submission metadata.
 *
 * @param complianceSummaryId - ID of the compliance summary being reviewed
 * @returns CreditsIssuanceRequestData with all fields needed for the form
 */
export const getCreditsIssuanceRequestData = (complianceSummaryId: string) => {
  const data: CreditsIssuanceRequestData = {
    id: complianceSummaryId,
    reporting_year: 2023,
    earned_credits_amount: 100,
    issuance_status: IssuanceStatus.APPROVED,
    bccr_trading_name: "Colour Co.",
    holding_account_id: "437248194316283",
    analyst_comment: "Lorem ipsum",
    submited_by: "Adam A.",
    submited_at: formatDate(
      new Date("2025-05-16 18:00:24.986 -0700"),
      "MMMM D, YYYY",
    ),
    analyst_recommendation: "ready_to_approve",
  };

  // Mock data for development and testing purposes
  //
  // TBD: API implementation for fetching this data from the backend
  // The actual API endpoint and data structure will be determined
  // during backend implementation

  return data;
};
