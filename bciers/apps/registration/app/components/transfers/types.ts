export interface TransferRow {
  id: number;
  operation: string;
  facilities: string;
  status: string;
  effective_date: string;
  submission_date: string;
}

export interface TransfersSearchParams {
  [key: string]: string | number | undefined;
  operation?: string;
  facilities?: string;
  status?: string;
}
