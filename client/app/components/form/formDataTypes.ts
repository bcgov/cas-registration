export interface UserOperatorFormData {
  role: string;
  status: string;
  first_name: string;
  last_name: string;
  position_title: string;
  street_address: string;
  municipality: string;
  postal_code: string;
  email: string;
  phone_number: string;
  province: string;
  is_senior_officer: string;
  legal_name: string;
  trade_name?: string;
  cra_business_number?: number;
  bc_corporate_registry_number?: number;
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
  so_first_name?: string;
  so_last_name?: string;
  so_position_title?: string;
  so_street_address?: string;
  so_municipality?: string;
  so_province?: string;
  so_postal_code?: string;
  so_email?: string;
  so_phone_number?: string;
  operator_has_parent_company: boolean;
  // PC = Parent Company
  pc_legal_name?: string;
  pc_cra_business_number?: number;
  pc_bc_corporate_registry_number?: number;
  pc_business_structure?: string;
  pc_physical_street_address?: string;
  pc_physical_municipality?: string;
  pc_physical_province?: string;
  pc_physical_postal_code?: string;
  pc_mailing_address_same_as_physical: boolean;
  pc_mailing_street_address?: string;
  pc_mailing_municipality?: string;
  pc_mailing_province?: string;
  pc_mailing_postal_code?: string;
  percentage_owned_by_parent_company?: number;
}

export interface SelectOperatorFormData {
  operator_id: number;
}
