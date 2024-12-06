export interface TransferRow {
  id: string;
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
  to_operator: string;
  transfer_entity: string;
  operation?: string;
  from_operation?: string;
  facilities?: string[];
  to_operation?: string;
  effective_date: string;
}

export interface Operation {
  id: string;
  name: string;
}
