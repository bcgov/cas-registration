import { UUID } from "crypto";

export interface ContactRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  operator__legal_name?: string;
}

export interface ContactsSearchParams {
  [key: string]: string | number | undefined;
  first_name?: string;
  last_name?: string;
  email?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
  operator_id?: UUID;
  operator__legal_name?: string;
}

export interface ContactFormData {
  id?: number;
  selected_user?: UUID;
  first_name?: string;
  last_name?: string;
  position_title?: string;
  email?: string;
  phone_number?: string;
  street_address?: string;
  municipality?: string;
  province?: string;
  postal_code?: string;
}

export interface UserOperatorUser {
  id: UUID;
  full_name: string;
}
