import { formatDate } from "@reporting/src/app/utils/formatDate";

export interface CreditsIssuanceRequestData {
  id: string;
  operation_name: string;
  reporting_year: number;
  earnedCredits: number;
  issuanceStatus: string;
  bccrTradingName: string;
  bccrHoldingAccountId: string;
  analyst_comment: string;
  submited_by: string;
  submited_at: string;
  attachment?: {
    id: string;
    file_name: string;
  };
  analyst_recommendation?: string;
}

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
    operation_name: "Red Operation",
    reporting_year: 2023,
    earnedCredits: 100,
    issuanceStatus: "Issuance requested, awaiting approval",
    bccrTradingName: "Colour Co.",
    bccrHoldingAccountId: "437248194316283",
    analyst_comment: "Lorem ipsum",
    submited_by: "Adam A.",
    submited_at: formatDate(
      new Date("2025-05-16 18:00:24.986 -0700"),
      "MMMM D, YYYY",
    ),
    attachment: {
      id: "attachment-123",
      file_name: "document.pdf",
    },
    analyst_recommendation: "ready_to_approve",
  };

  // Mock data for development and testing purposes
  //
  // TBD: API implementation for fetching this data from the backend
  // The actual API endpoint and data structure will be determined
  // during backend implementation

  return data;
};
