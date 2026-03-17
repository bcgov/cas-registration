import { UUID } from "crypto";

export interface OperatorRow {
  id: UUID;
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
