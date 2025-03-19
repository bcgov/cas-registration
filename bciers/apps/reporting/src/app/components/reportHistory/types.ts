export interface ReportHistoryRow {
  id: number;
  version: string;
  updated_at: string;
  status: string;
  report_type: string;
  submitted_by: string;
}
export interface ReportHistorySearchParams {
  [key: string]: string | number | undefined;
  version?: string;
  updated_at?: string;
  status?: number;
  report_type?: string;
  submitted_by?: string;
}
