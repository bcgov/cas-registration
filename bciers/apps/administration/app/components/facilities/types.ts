export interface FacilityRow {
  id: number;
  bcghg_id: string;
  name: string;
  type: string;
  status: string;
}

export interface FacilityInitialData {
  rows: FacilityRow[];
  row_count: number;
}

export interface FacilitiesSearchParams {
  [key: string]: string | number | undefined;
  operations_title?: string;
  bcghg_id?: string;
  type?: string;
  status?: string;
  name?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
}
