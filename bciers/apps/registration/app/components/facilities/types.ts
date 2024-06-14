export interface FacilityRow {
  id: number;
  bcghg_id: string;
  name: string;
  status: string;
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
