import { OperatorStatus } from "@bciers/utils/src/enums";

export interface UserFormData {
  first_name: string;
  last_name: string;
  bceid_business_name: string;
  position_title: string;
  street_address: string;
  municipality: string;
  postal_code: string;
  email: string;
  phone_number: string;
  province: string;
  role: string;
  status: string;
}

interface ParentOperator {
  // PO = Parent Operator(Company)
  po_legal_name?: string;
  po_trade_name?: string;
  po_cra_business_number?: number;
  po_bc_corporate_registry_number?: string;
  po_business_structure?: string;
  po_website?: string;
  po_physical_street_address?: string;
  po_physical_municipality?: string;
  po_physical_province?: string;
  po_physical_postal_code?: string;
  po_mailing_address_same_as_physical: boolean;
  po_mailing_street_address?: string;
  po_mailing_municipality?: string;
  po_mailing_province?: string;
  po_mailing_postal_code?: string;
}

export interface UserOperatorFormData extends UserFormData {
  operator_status: OperatorStatus;
  is_senior_officer: string;
  legal_name: string;
  trade_name?: string;
  cra_business_number?: number;
  bc_corporate_registry_number?: string;
  business_structure: string;
  physical_street_address: string;
  physical_municipality: string;
  physical_province: string;
  physical_postal_code: string;
  mailing_address_same_as_physical: boolean;
  mailing_street_address: string;
  mailing_municipality: string;
  mailing_province: string;
  mailing_postal_code: string;
  website?: string;
  // SO = Senior Officer
  so_email?: string;
  so_phone_number?: string;
  operator_has_parent_operators: boolean;
  parent_operators_array?: Array<ParentOperator>;
  // Not in form, but needed for API to create a contact based on the existing user-operator
  user_operator_id?: string;
  operator_id: number;
}

export interface UserProfileFormData {
  first_name: string;
  last_name: string;
  position_title: string;
  email: string;
  phone_number: string;
  app_role?: { role_name: string };
}

export interface UserProfilePartialFormData {
  first_name?: string;
  last_name?: string;
  position_title?: string;
  email?: string;
  phone_number?: string;
  app_role?: { role_name: string };
}

export interface SelectOperatorFormData {
  search_type: string;
  legal_name?: string;
  cra_business_number?: number;
}

export interface UserInformationInitialFormData {
  phone_number: string;
  email: string;
  app_role: { role_name: string };
}
