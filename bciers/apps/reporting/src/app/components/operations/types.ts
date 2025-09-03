export interface OperationRow {
  id: string;
  bcghg_id: string;
  operation_name: string;
  operator: string;
  report_version_id: number;
  report_status: string;
}

export interface OperationsSearchParams {
  [key: string]: string | number | undefined;
  bcghg_id?: string;
  reporting_year?: number;
  name?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
}
export interface Contact {
  id?: number;
  first_name?: string;
  last_name?: string;
  position_title?: string;
  email?: string;
  phone_number?: string;
  street_address?: string;
  municipality?: string;
  province?: string;
  postal_code?: string;
}

export interface ContactRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface ReportRow {
  id: number;
  reporting_year: number;
  operation_name: string;
  operator?: string;
  report_version_id: number;
  report_status?: string;
}

export interface ReportSearchParams {
  [key: string]: string | number | undefined;
  reporting_year?: number;
  operation_name?: string;
  report_version_id?: number;
  page?: number;
  sort_field?: string;
  sort_order?: string;
}
