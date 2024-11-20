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
