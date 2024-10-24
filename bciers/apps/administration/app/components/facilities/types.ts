export interface FacilityRow {
  id: number;
  facility__bcghg_id: string;
  facility__name: string;
  facility__type: string;
  facility__status: string;
  facility__id: number;
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
