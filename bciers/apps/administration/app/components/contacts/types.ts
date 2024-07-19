import { UUID } from "crypto";

export interface ContactRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface ContactsSearchParams {
  [key: string]: string | number | undefined;
  first_name?: string;
  last_name?: string;
  email?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
}

export interface ContactFormData {
  selected_user?: UUID;
  first_name?: string;
  last_name?: string;
  position_title?: string;
  email?: string;
  phone_number?: string;
}

export interface UserOperatorUser {
  id: UUID;
  full_name: string;
}
