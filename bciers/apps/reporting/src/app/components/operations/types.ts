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

export interface ReportOperationRepresentative {
  id: number;
  representative_name: string;
  selected_for_report: boolean;
}

export interface ReportOperationSchemaOut {
  operator_legal_name: string;
  operator_trade_name?: string | null;
  operation_name: string;
  registration_purpose: string;
  operation_type: string;
  operation_bcghgid?: string | null;
  bc_obps_regulated_operation_id: string;
  activities: number[];
  regulated_products: number[];
  report_operation_representatives: ReportOperationRepresentative[];
  operation_representative_name: number[];
  operation_report_type: string;
  operation_report_status: string;
  operation_id: string; // UUID
}

export interface Activity {
  id: number;
  name: string;
  applicable_to: string;
  regulated_name: string;
}

export interface RegulatedProduct {
  id: number;
  name: string;
  is_regulated: boolean;
  unit: string;
}

export interface OperationReviewPageData {
  report_operation: ReportOperationSchemaOut;
  facility_id: string; // UUID
  all_activities: Activity[];
  all_regulated_products: RegulatedProduct[];
  all_representatives: ReportOperationRepresentative[];
  report_type: string;
  show_regulated_products: boolean;
  show_boro_id: boolean;
  show_activities: boolean;
  reporting_year: number;
  is_sync_allowed: boolean;
}
