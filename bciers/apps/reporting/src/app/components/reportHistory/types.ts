export interface OperationRow {
  id: number;
  bcghg_id: string;
  name: string;
  operator: string;
}

export interface OperationsSearchParams {
  [key: string]: string | number | undefined;
  bcghg_id?: string;
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
