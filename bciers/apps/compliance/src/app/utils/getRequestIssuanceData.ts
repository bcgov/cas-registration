export interface RequestIssuanceData {
  bccrTradingName: string;
  bccrHoldingAccountId: string;
  reportingYear: number;
  operation_name: string;
}

export async function getRequestIssuanceData(): Promise<RequestIssuanceData> {
  const mockData = {
    reportingYear: 2023,
    operation_name: "Sample Operation",
    bccrTradingName: "Colour Co.",
    bccrHoldingAccountId: "123456789012345",
  };

  // TODO: Uncomment this block when the API route is ready

  // const endpoint = `compliance/summaries/${complianceSummaryId}/issuance-request`;
  // const response = await actionHandler(endpoint, "GET", "");

  // if (response.error) {
  //   throw new Error(
  //     `Failed to fetch request issuance data for compliance summary ${complianceSummaryId}`,
  //   );
  // }

  // return {
  //   reportingYear: response.reporting_year,
  //   operation_name: response.operation_name,
  //   bccrTradingName: response.bccr_trading_name,
  //   bccrHoldingAccountId: response.bccr_holding_account_id,
  // };

  return mockData;
}
