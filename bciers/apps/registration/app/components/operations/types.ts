import { UUID } from "crypto";

export interface OperationRegistrationFormData {
  registration_purpose?: string;
  regulated_products?: number[];
  operation_type?: string;
}

export interface OperationData {
  // Need to double check that these types are correct
  id: UUID;
  name?: string;
  type?: "Linear Facility Operation" | "Single Facility Operation";
  opt_in?: boolean;
  regulated_products?: string[];
  status?: string;
  naics_code_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  position_title?: string;
  street_address?: string;
  municipality?: string;
  province?: string;
  postal_code?: string;
  statutory_declaration?: string;
  bc_obps_regulated_operation?: string;
  bcghg_id?: null;
  operator?: string;
}
