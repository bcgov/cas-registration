export interface DataGridSearchParams {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ComplianceSummary {
  id: number;
  operation_name: string;
  reporting_year: number;
  excess_emissions: number;
  outstanding_balance?: number;
  status?: string;
  penalty_status?: string;
  obligation_id?: string;
}

export interface BccrAccountDetailsResponse {
  bccr_holding_account_id?: string;
  bccr_trading_name?: string | null;
  error?: string;
  bccr_compliance_account_id?: string;
  charge_rate: number;
}

export interface BccrComplianceAccountResponse {
  bccr_trading_name?: string | null;
  bccr_compliance_account_id?: string;
  bccr_units?: BccrUnit[];
  charge_rate: number;
  outstanding_balance: number;
}

export interface ApplyComplianceUnitsFormData
  extends BccrComplianceAccountResponse {
  bccr_holding_account_id?: string;
  total_quantity_to_be_applied: number;
  total_equivalent_emission_reduced: number;
  total_equivalent_value: number;
  outstanding_balance: number;
}

export interface BccrUnit {
  id: string;
  type: string;
  serial_number: string;
  vintage_year: number;
  quantity_available: number;
  quantity_to_be_applied: number;
  equivalent_emission_reduced: number;
  equivalent_value: number;
}

export interface Payment {
  id: string | number;
  paymentReceivedDate: string;
  paymentAmountApplied: number;
  paymentMethod: string;
  transactionType: string;
  receiptNumber: string;
}

export interface PaymentsData {
  rows: Payment[];
  row_count: number;
}

export interface ComplianceSummaryReviewData {
  operation_name: string;
  reporting_year: number;
  emissions_attributable_for_compliance: string;
  emission_limit: string;
  excess_emissions: number;
  earned_credits_amount: number;
  issuance_status: string;
  earned_credits_issued: boolean;
  id: number;
}

export interface RequestIssuanceTrackStatusData {
  operation_name: string;
  earned_credits: number;
  issuance_status: string;
  bccr_trading_name: string;
  directors_comments: string;
}

export interface PaymentSummary {
  compliance_year: number;
  operation_name: string;
  payment_towards: string;
  invoice_number: string;
  payment_amount: number;
  outstanding_balance: number;
}
