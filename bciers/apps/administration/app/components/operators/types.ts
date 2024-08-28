export interface OperatorRow {
  id: number;
  legal_name: string;
  business_structure: string;
  cra_business_number: string;
  bc_corporate_registry_number: string;
}

export interface OperatorsSearchParams {
  [key: string]: string | number | undefined;
  legal_name?: string;
  business_structure?: string;
  cra_business_number?: string;
  bc_corporate_registry_number?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
}

// export interface OperatorInformationFormData {
//   name: string;
//   type: string;
//   naics_code_id: number;
//   secondary_naics_code_id: number;
//   tertiary_naics_code_id: number;
//   reporting_activities: string[];
//   operation_has_multiple_operators: boolean;
//   multiple_operators_array?: {
//     mo_is_extraprovincial_company: boolean;
//     mo_legal_name: string;
//     mo_attorney_street_address?: string;
//     mo_municipality: string;
//     mo_province: string;
//     mo_postal_code: string;
//   }[];
//   registration_purpose?: string;
//   regulated_operation?: string;
//   new_entrant_operation?: string;
//   regulated_products?: number[];
//   forcasted_emmisions?: string;
// }

// export interface OperatorInformationPartialFormData {
//   name?: string;
//   type?: string;
//   naics_code_id?: number;
//   secondary_naics_code_id?: number;
//   tertiary_naics_code_id?: number;
//   reporting_activities?: string[];
//   operation_has_multiple_operators?: boolean;
//   multiple_operators_array?: {
//     mo_is_extraprovincial_company: boolean;
//     mo_legal_name?: string;
//     mo_attorney_street_address?: string;
//     mo_municipality?: string;
//     mo_province?: string;
//     mo_postal_code?: string;
//   }[];
//   registration_purpose?: string;
//   regulated_operation?: string;
//   new_entrant_operation?: string;
//   regulated_products?: number[];
//   forcasted_emmisions?: string;
// }
