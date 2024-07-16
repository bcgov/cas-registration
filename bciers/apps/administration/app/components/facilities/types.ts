export interface FacilityRow {
  id: number;
  bcghg_id: string;
  name: string;
  type: string;
}

export interface FacilityInitialData {
  rows: FacilityRow[];
  row_count: number;
}

export interface FacilitiesSearchParams {
  [key: string]: string | number | undefined;
  bcghg_id?: string;
  type?: string;
  name?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
}
