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

export interface Operator {
  id: number;
  legal_name: string;
  trade_name: string;
  cra_business_number: string;
  bc_corporate_registry_number: string;
  business_structure: string;
  physical_street_address: string;
  physical_municipality: string;
  physical_province: string;
  physical_postal_code: string;
  mailing_street_address: string;
  mailing_municipality: string;
  mailing_province: string;
  mailing_postal_code: string;
  website: string;
  contacts: Array<number>;
}

export interface BusinessStructure {
  name: string;
}

export interface SelectOperatorFormData {
  search_type: string;
  legal_name?: string;
  cra_business_number?: number;
}
