import { OptedInOperationFormData } from "@/registration/app/components/operations/registration/types";
import { UUID } from "crypto";

export interface OperationRow {
  operation__name: string;
  operation__type: string;
  operation__status: string;
  operation__id: UUID;
  sfo_facility_id: string | null;
  sfo_facility_name: string | null;
  operation__bcghg_id: string | null;
  operation__bc_obps_regulated_operation: string | null;
  operation__registration_purpose: string;
  id: number;
  operator__legal_name: string;
  status: string;
}

export interface OperationsSearchParams {
  [key: string]: string | number | undefined | boolean;
  bcghg_id?: string;
  name?: string;
  operator?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
  type?: string;
  operator_id?: string;
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
  opted_in_operation?: OptedInOperationFormData;
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
  new_entrant_application?: string;
  date_of_first_shipment?: string;
}
