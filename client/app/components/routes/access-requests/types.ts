export interface OperatorsSearchParams {
  [key: string]: string | number | undefined;
  page?: number;
  sort_field?: string;
  sort_order?: string;
}

export interface UserOperator {
  id: number;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  legal_name: string;
}

export interface UserOperatorPaginated {
  rows: UserOperator[];
  row_count: number;
  page?: number;
}
