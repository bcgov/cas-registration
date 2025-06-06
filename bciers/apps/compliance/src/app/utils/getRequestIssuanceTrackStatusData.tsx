import { RequestIssuanceTrackStatusData } from "@/compliance/src/app/types";

export enum IssuanceStatus {
  APPROVED = "approved",
  AWAITING = "awaiting",
}

export const mockRequestIssuanceTrackStatusData: {
  [key: string]: RequestIssuanceTrackStatusData;
} = {
  awaiting: {
    operation_name: "Colour Co.",
    earned_credits: 100,
    issuance_status: IssuanceStatus.AWAITING,
    bccr_trading_name: "Colour Co.",
    directors_comments: "",
  },
  approved: {
    operation_name: "Colour Co.",
    earned_credits: 100,
    issuance_status: IssuanceStatus.APPROVED,
    bccr_trading_name: "Colour Co.",
    directors_comments: "Lorem ipsum",
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
  //   earned_credits: response.earned_credits,
  //   issuance_status: response.issuance_status,
  //   bccr_trading_name: response.bccr_trading_name,
  //   directors_comments: response.directors_comments,
  // };

  return mockRequestIssuanceTrackStatusData.awaiting;
}
