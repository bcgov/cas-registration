export interface ComplianceSummariesSearchParams {
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
  tradingName: string | null;
  error?: string;
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
