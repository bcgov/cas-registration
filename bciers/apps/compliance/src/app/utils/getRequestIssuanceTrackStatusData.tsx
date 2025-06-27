import { RequestIssuanceTrackStatusData } from "@/compliance/src/app/types";
import { IssuanceStatus } from "@bciers/utils/src/enums";

export const mockRequestIssuanceTrackStatusData: {
  [key: string]: RequestIssuanceTrackStatusData;
} = {
  awaiting: {
    earned_credits: 100,
    issuance_status: IssuanceStatus.AWAITING_APPROVAL,
    bccr_trading_name: "Colour Co.",
    holding_account_id: "123456789012345",
    directors_comments: "",
    analysts_comments: "",
  },
  approved: {
    earned_credits: 100,
    issuance_status: IssuanceStatus.APPROVED,
    bccr_trading_name: "Colour Co.",
    holding_account_id: "123456789012345",
    directors_comments: "Lorem ipsum",
    analysts_comments: "",
  },
  declined: {
    earned_credits: 100,
    issuance_status: IssuanceStatus.DECLINED,
    bccr_trading_name: "Colour Co.",
    holding_account_id: "123456789012345",
    directors_comments: "Lorem ipsum",
    analysts_comments: "",
  },
  changes_required: {
    earned_credits: 100,
    issuance_status: IssuanceStatus.CHANGES_REQUIRED,
    bccr_trading_name: "Colour Co.",
    holding_account_id: "123456789012345",
    directors_comments: "",
    analysts_comments: "Lorem ipsum",
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

  return mockRequestIssuanceTrackStatusData.approved;
}
