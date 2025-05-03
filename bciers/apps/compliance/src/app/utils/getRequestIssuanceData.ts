export interface RequestIssuanceData {
  bccrTradingName: string;
  validBccrHoldingAccountId: string;
  reportingYear: number;
  operation_name: string;
}

export async function getRequestIssuanceData(): Promise<RequestIssuanceData> {
  // Mock data for development
  return {
    reportingYear: 2023,
    operation_name: "Operation 2",
    bccrTradingName: "Colour Co.",
    validBccrHoldingAccountId: "123456789012345",
  };
}
