export interface RequestIssuanceData {
  bccrTradingName: string;
  validBccrHoldingAccountId: string;
  reportingYear: number;
  operation_name: string;
}

export async function getRequestIssuanceData(): Promise<RequestIssuanceData> {
  // TODO: Uncomment this code after the backend is implemented
  /*
  const data = await actionHandler(
    `compliance/summaries/${complianceSummaryId}/request-issuance`,
    "GET",
    "",
  );

  if (data?.error) {
    throw new Error(`Failed to fetch request issuance data: ${data.error}`);
  }

  if (!data || typeof data !== "object") {
    throw new Error(
      "Invalid response format from request issuance endpoint",
    );
  }

  return data;
  */

  // Mock data for development
  return {
    reportingYear: 2023,
    operation_name: "Operation 2",
    bccrTradingName: "Colour Co.",
    validBccrHoldingAccountId: "123456789012345",
  };
}
