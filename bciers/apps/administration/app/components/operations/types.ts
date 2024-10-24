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

export interface OperationInformationFormData {
  name: string;
  type: string;
  naics_code_id: number;
  secondary_naics_code_id: number;
  tertiary_naics_code_id: number;
  reporting_activities: string[];
  operation_has_multiple_operators: boolean;
  multiple_operators_array?: {
    mo_is_extraprovincial_company: boolean;
    mo_legal_name: string;
    mo_attorney_street_address?: string;
    mo_municipality: string;
    mo_province: string;
    mo_postal_code: string;
  }[];
  registration_purpose?: string;
  regulated_operation?: string;
  new_entrant_operation?: string;
  regulated_products?: number[];
  forcasted_emmisions?: string;
  opted_in_operation?: {
    meets_electricity_import_operation_criteria?: boolean;
    meets_entire_operation_requirements?: boolean;
    meets_naics_code_11_22_562_classification_requirements?: boolean;
    meets_notification_to_director_on_criteria_change?: boolean;
    meets_producing_gger_schedule_a1_regulated_product?: boolean;
    meets_reporting_and_regulated_obligations?: boolean;
    meets_section_3_emissions_requirements?: boolean;
    meets_section_6_emissions_requirements?: boolean;
  };
}

export interface OperationInformationPartialFormData {
  name?: string;
  type?: string;
  naics_code_id?: number;
  secondary_naics_code_id?: number;
  tertiary_naics_code_id?: number;
  reporting_activities?: string[];
  operation_has_multiple_operators?: boolean;
  multiple_operators_array?: {
    mo_is_extraprovincial_company: boolean;
    mo_legal_name?: string;
    mo_attorney_street_address?: string;
    mo_municipality?: string;
    mo_province?: string;
    mo_postal_code?: string;
  }[];
  registration_purpose?: string;
  regulated_operation?: string;
  new_entrant_operation?: string;
  regulated_products?: number[];
  forcasted_emmisions?: string;
  status?: string;
}
