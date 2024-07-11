export interface OperationRow {
  id: number;
  bcghg_id: string;
  name: string;
  operator: string;
  type: string;
}

export interface OperationsSearchParams {
  [key: string]: string | number | undefined;
  bcghg_id?: string;
  name?: string;
  operator?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
  type?: string;
}

export interface OperationFormData {
  name: string;
  type: string;
  naics_code_id: number;
  secondary_naics_code_id?: number;
  tertiary_naics_code_id?: number;
  reporting_activities?: string[];
  operation_has_multiple_operators: boolean;
  multiple_operators_array?: {
    mo_is_extraprovincial_company: boolean;
    mo_legal_name?: string;
    mo_attorney_street_address?: string;
    mo_municipality?: string;
    mo_province?: string;
    mo_postal_code?: string;
  }[];
  registration_category?: string;
  regulated_operation?: string;
  new_entrant_operation?: string;
  regulated_products?: string;
  forcasted_emmisions?: string;
}
