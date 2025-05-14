import { actionHandler } from "@bciers/actions";

export interface RequestIssuanceData {
  bccrTradingName: string;
  bccrHoldingAccountId: string;
  reportingYear: number;
  operation_name: string;
}

export async function getRequestIssuanceData(
  complianceSummaryId?: number,
): Promise<RequestIssuanceData> {
  const endpoint = `compliance/summaries/${complianceSummaryId}/issuance-request`;
  const response = await actionHandler(endpoint, "GET", "");

  if (response.error) {
    throw new Error(
      `Failed to fetch request issuance data for compliance summary ${complianceSummaryId}`,
    );
  }

  return {
    reportingYear: response.reporting_year,
    operation_name: response.operation_name,
    bccrTradingName: response.bccr_trading_name,
    bccrHoldingAccountId: response.bccr_holding_account_id,
  };
}
