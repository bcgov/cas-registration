export interface UserOperator {
  id: number;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  legal_name: string;
}

export interface UserOperatorPaginated {
  data: UserOperator[];
  row_count: number;
  page: number;
}
