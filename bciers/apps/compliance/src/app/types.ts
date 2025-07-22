import {
  AnalystSuggestion,
  ComplianceSummaryStatus,
  IssuanceStatus,
} from "@bciers/utils/src/enums";

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
  emissions_limit: string;
  excess_emissions: number;
}

export interface RequestIssuanceTrackStatusData {
  earned_credits: number;
  issuance_status: string;
  bccr_trading_name: string;
  holding_account_id: string;
  director_comment: string;
  analyst_comment: string;
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
  reporting_year: number;
  emissions_attributable_for_compliance: number;
  emissions_limit: number;
  excess_emissions: number;
  earned_credits_amount: number;
  issuance_status: IssuanceStatus;
  bccr_trading_name: string;
  bccr_holding_account_id: string;
  analyst_comment: string;
  director_comment: string;
  analyst_submitted_date: string;
  analyst_submitted_by: string;
  analyst_suggestion: AnalystSuggestion;
}

export interface ComplianceEarnedCreditData {
  bccr_holding_account_id?: string;
  bccr_trading_name?: string;
  analyst_comment?: string;
  analyst_suggestion?: AnalystSuggestion;
  director_comment?: string;
  director_decision?: "Approved" | "Declined";
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
  payment_data: PaymentData;
  penalty_status?: string;
  data_is_fresh?: string;
}

export interface PayObligationTrackPaymentsFormData extends ObligationData {
  payments: Payment[];
}

export interface ComplianceSummary {
  id: number;
  operation_name: string;
  reporting_year: number;
  excess_emissions: number;
  outstanding_balance?: number;
  status?: ComplianceSummaryStatus;
  penalty_status?: string;
  obligation_id?: string;
  issuance_status?: IssuanceStatus;
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
  compliance_report_version_id: number;
  applied_compliance_units: ComplianceAppliedUnitsData;
}

export interface ComplianceSummaryReviewPageData extends ComplianceSummary {
  monetary_payments: PaymentData;
  applied_units_summary: ComplianceAppliedUnitsSummary;
}

export interface Invoice {
  invoice_number: string;
}

export interface HasComplianceReportVersion {
  compliance_report_version_id: number;
}

export interface AutomaticOverduePenalty {
  penalty_status: string;
  penalty_type: string;
  days_late: number;
  penalty_charge_rate: string;
  accumulated_penalty: string;
  accumulated_compounding: string;
  total_penalty: string;
  faa_interest: string;
  total_amount: string;
}
