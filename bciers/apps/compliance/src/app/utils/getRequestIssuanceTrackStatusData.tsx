import { actionHandler } from "@bciers/actions";

export enum IssuanceStatus {
  APPROVED = "approved",
  AWAITING = "awaiting",
}

export interface RequestIssuanceTrackStatusData {
  operation_name: string;
  earnedCredits: number;
  issuanceStatus: string;
  bccrTradingName: string;
  directorsComments: string;
}

export async function getRequestIssuanceTrackStatusData(
  complianceSummaryId: string,
): Promise<RequestIssuanceTrackStatusData> {
  const endpoint = `compliance/compliance-report-version/${complianceSummaryId}/issuance-status`;
  const response = await actionHandler(endpoint, "GET", "");
  if (response.error) {
    throw new Error(
      `Failed to fetch request issuance data for compliance summary ${complianceSummaryId}`,
    );
  }

  return {
    operation_name: response.operation_name,
    earnedCredits: response.earned_credits,
    issuanceStatus: response.issuance_status,
    bccrTradingName: response.bccr_trading_name,
    directorsComments: response.directors_comments,
  };
}
