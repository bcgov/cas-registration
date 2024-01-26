export interface Operation {
  id: number;
  name: string;
  type: string;
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at?: string;
  archived_by?: string;
  archived_at?: string;
  naics_code: number;
  previous_year_attributable_emissions?: number;
  swrs_facility_id?: number;
  bcghg_id?: string;
  opt_in?: boolean;
  operator: number;
  operation_has_multiple_operators: boolean;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  position_title: string;
  street_address: string;
  muncipality: string;
  province: string;
  postal_code: string;
  status: string;
  bc_obps_regulated_operation?: number;
  statutory_declaration: string;
  regulated_products: Array<any>; // Change this once we have the RegulatedProduct type
  reporting_activities: Array<any>; // Change this once we have the ReportingActivity type
  operator_id: number;
  naics_code_id: number;
  is_user_point_of_contact?: boolean;
  multiple_operators_array?: Array<any>; // Change this once we have the MultipleOperator type
}
