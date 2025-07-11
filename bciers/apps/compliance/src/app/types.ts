export interface DataGridSearchParams {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BccrAccountDetailsResponse {
  bccr_trading_name?: string | null;
  error?: string;
}

export interface BccrComplianceAccountResponse {
  bccr_trading_name?: string | null;
  bccr_compliance_account_id?: string;
  bccr_units?: BccrUnit[];
  charge_rate: number;
  outstanding_balance: number;
}

export interface RequestIssuanceOfEarnedCreditsFormData {
  bccr_holding_account_id?: string;
  bccr_trading_name?: string;
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

export interface ComplianceSummaryReviewNoEmissionNoObligationData {
  reporting_year: number;
  emissions_attributable_for_compliance: string;
  emission_limit: string;
  excess_emissions: number;
}

export interface RequestIssuanceTrackStatusData {
  earned_credits: number;
  issuance_status: string;
  bccr_trading_name: string;
  holding_account_id: string;
  directors_comments: string;
  analysts_comments: string;
}

export interface DirectorReviewData {
  id: string;
  reporting_year: number;
  earned_credits_amount: number;
  issuance_status: string;
  bccr_trading_name: string;
  holding_account_id: string;
  analyst_comment: string;
  analyst_recommendation?: string;
  director_comment?: string;
}

export interface CreditsIssuanceRequestData {
  id: string;
  reporting_year: number;
  earned_credits_amount: number;
  issuance_status: string;
  bccr_trading_name: string;
  holding_account_id: string;
  analyst_comment: string;
  submitted_by: string;
  submitted_at: string;
  analyst_recommendation?: string;
}

export interface ComplianceAppliedUnits {
  id: string;
  type: string;
  serial_number: string;
  vintage_year: string;
  quantity_applied: number;
  equivalent_value: number;
}

export interface RequestIssuanceComplianceSummaryData {
  operation_name: string;
  reporting_year: number;
  emissions_attributable_for_compliance: number;
  emission_limit: number;
  excess_emissions: number;
  earned_credits_issued: boolean;
  id: number;
  earned_credits_amount: number;
  issuance_status: string;
  bccr_trading_name: string;
  analyst_comment: string;
  director_comment: string;
}

export interface PaymentSummary {
  compliance_year: number;
  operation_name: string;
  payment_towards: string;
  invoice_number: string;
  payment_amount: number;
  outstanding_balance: number;
}

export interface Payment {
  id: string | number;
  received_date: string;
  amount: number;
  payment_method: string;
  transaction_type: string;
  payment_object_id: string;
  payment_header?: string;
}

export interface PaymentData {
  data_is_fresh?: boolean;
  rows: Payment[];
  row_count: number;
}

export interface ObligationData {
  reporting_year: number;
  outstanding_balance: number;
  equivalent_value: number;
  obligation_id: string;
  payments: PaymentData;
}

export interface PayObligationTrackPaymentsFormData {
  outstanding_balance: number;
  equivalent_value: number;
  payments: Payment[];
  reporting_year: number;
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
  issuance_status?: string;
  compliance_charge_rate?: number;
  outstanding_balance_tco2e?: number;
  equivalent_value?: number;
  outstanding_balance_equivalent_value?: number;
}

export interface ComplianceAppliedUnitsData {
  rows: ComplianceAppliedUnits[];
  row_count: number;
}
export interface ComplianceAppliedUnitsSummary {
  compliance_report_version_id: string;
  applied_compliance_units: ComplianceAppliedUnitsData;
}

export interface ComplianceSummaryReviewPageData extends ComplianceSummary {
  monetary_payments: PaymentData;
  applied_units_summary: ComplianceAppliedUnitsSummary;
}

export interface Invoice {
  invoice_number: string;
}
