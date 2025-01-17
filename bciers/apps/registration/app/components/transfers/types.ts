import { UUID } from "crypto";

export interface TransferRow {
  id: string; // random ID to avoid duplicate key error in the UI when rendering the table
  transfer_id: UUID; // actual transfer ID
  operation__name?: string;
  facilities__name?: string;
  status: string;
  created_at: string | undefined;
  effective_date?: string | undefined;
}

export interface TransfersSearchParams {
  [key: string]: string | number | undefined;
  operation?: string;
  facilities?: string;
  status?: string;
}

export interface TransferFormData {
  [key: string]: string | number | undefined | string[];
  from_operator: string;
  from_operator_id: UUID;
  to_operator: string;
  to_operator_id: UUID;
  transfer_entity: string;
  operation?: string;
  operation_id?: UUID;
  from_operation?: string;
  from_operation_id?: UUID;
  facilities?: string[];
  facilities_ids?: UUID[];
  to_operation?: string;
  to_operation_id?: UUID;
  effective_date: string;
}

export interface ExistingFacilities {
  id: UUID;
  name: string;
}

export interface TransferDetailFormData {
  [key: string]: string | number | undefined | string[] | ExistingFacilities[];
  from_operator: string;
  from_operator_id: UUID;
  to_operator: string;
  transfer_entity: string;
  operation?: UUID;
  operation_name?: string;
  from_operation?: string;
  from_operation_id?: UUID;
  facilities?: UUID[];
  existing_facilities: ExistingFacilities[];
  to_operation?: string;
  effective_date: string;
}
