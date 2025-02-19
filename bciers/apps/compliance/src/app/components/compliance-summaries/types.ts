export interface ComplianceSummariesSearchParams {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ComplianceSummary {
  id: string;
  reportingYear: number;
  operationName: string;
  excessEmissions: number;
} 