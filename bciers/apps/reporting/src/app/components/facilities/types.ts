export interface FacilityRow {
  id: number;
  bcghg_id: string;
  name: string;
  facility_type: string;
  activities: number[];
  products: string[];
}

export interface FacilitiesSearchParams {
  [key: string]: string | number | undefined;
  bcghg_id?: string;
  name?: string;
  facility_type?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
}
