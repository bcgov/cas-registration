export interface InternalComplianceSummaryReviewData {
  operationName: string;
  emissionsAttributableForCompliance: string;
  emissionLimit: string;
  excessEmissions: string;
  earnedCredits: number;
  issuanceStatus: string;
  bccrTradingName: string;
  bccrHoldingAccountId: string;
  directorsComments: string;
  reportingYear: number;
}

// Mock data for testing the component
export const mockInternalComplianceSummaryReviewData: {
  [key: string]: InternalComplianceSummaryReviewData;
} = {
  awaiting: {
    operationName: "Colour Co.",
    emissionsAttributableForCompliance: "900",
    emissionLimit: "1000",
    excessEmissions: "-100",
    earnedCredits: 100,
    issuanceStatus: "Issuance requested, awaiting approval",
    bccrTradingName: "Colour Co.",
    bccrHoldingAccountId: "123456789012345",
    directorsComments: "",
    reportingYear: 2024,
  },
  approved: {
    operationName: "Colour Co.",
    emissionsAttributableForCompliance: "900",
    emissionLimit: "1000",
    excessEmissions: "-100",
    earnedCredits: 100,
    issuanceStatus: "Approved, credits issued in BCCR",
    bccrTradingName: "Colour Co.",
    bccrHoldingAccountId: "123456789012345",
    directorsComments: "Credits have been issued to the BCCR account.",
    reportingYear: 2024,
  },
  rejected: {
    operationName: "Colour Co.",
    emissionsAttributableForCompliance: "900",
    emissionLimit: "1000",
    excessEmissions: "-100",
    earnedCredits: 100,
    issuanceStatus: "Rejected",
    bccrTradingName: "Colour Co.",
    bccrHoldingAccountId: "123456789012345",
    directorsComments: "Application rejected due to incomplete information.",
    reportingYear: 2024,
  },
};

export async function getInternalComplianceSummaryReviewData(): Promise<InternalComplianceSummaryReviewData> {
  // complianceSummaryId: string,
  // TODO: When the API endpoint is ready, uncomment the following code to use the real implementation
  // const endpoint = `compliance/compliance-report-versions/${complianceSummaryId}/internal-review`;
  // const response = await actionHandler(endpoint, "GET", "");
  // if (response.error) {
  //   throw new Error(
  //     `Failed to fetch internal compliance summary review data for compliance summary ${complianceSummaryId}`,
  //   );
  // }

  // For now, return mock data
  return mockInternalComplianceSummaryReviewData.awaiting;
}
