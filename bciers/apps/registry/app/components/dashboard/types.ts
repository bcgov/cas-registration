export interface DashboardSearchParams {
    [key: string]: string | number | undefined | boolean;
    account_name?: string;
    account_type?: string;
    classification?: string;
    country?: string;
    website?: string;
    project_name?: string;
    validator?: string;
    serial_number?: string;
    page?: number;
    sort_field?: string;
    sort_order?: string;
  }