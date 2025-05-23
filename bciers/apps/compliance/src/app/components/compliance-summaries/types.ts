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
