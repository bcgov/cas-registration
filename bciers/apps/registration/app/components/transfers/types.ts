export interface TransferRow {
  id: string;
  operation__name: string;
  facilities__name: string;
  status: string;
  created_at: string;
  effective_date: string;
}

export interface TransfersSearchParams {
  [key: string]: string | number | undefined;
  operation?: string;
  facilities?: string;
  status?: string;
}
