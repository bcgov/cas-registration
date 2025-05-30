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

export const mockRequestIssuanceTrackStatusData: {
  [key: string]: RequestIssuanceTrackStatusData;
} = {
  awaiting: {
    operation_name: "Colour Co.",
    earnedCredits: 100,
    issuanceStatus: IssuanceStatus.AWAITING,
    bccrTradingName: "Colour Co.",
    directorsComments: "",
  },
  approved: {
    operation_name: "Colour Co.",
    earnedCredits: 100,
    issuanceStatus: IssuanceStatus.APPROVED,
    bccrTradingName: "Colour Co.",
    directorsComments: "Lorem ipsum",
  },
};

export async function getRequestIssuanceTrackStatusData(): Promise<RequestIssuanceTrackStatusData> {
  // complianceSummaryId: string,
  // TODO: When the API endpoint is ready, uncomment the following code to use the real implementation
  // const endpoint = `compliance/compliance-report-versions/${complianceSummaryId}/earned-credits`;
  // const response = await actionHandler(endpoint, "GET", "");
  // if (response.error) {
  //   throw new Error(
  //     `Failed to fetch request issuance data for compliance summary ${complianceSummaryId}`,
  //   );
  // }
  // return {
  //   operation_name: response.operation_name,
  //   earnedCredits: response.earned_credits,
  //   issuanceStatus: response.issuance_status,
  //   bccrTradingName: response.bccr_trading_name,
  //   directorsComments: response.directors_comments,
  // };

  return mockRequestIssuanceTrackStatusData.approved;
}
