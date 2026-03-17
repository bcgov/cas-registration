import { UUID } from "crypto";

export interface FacilityRow {
  id: UUID;
  facility__bcghg_id__id: string;
  facility__name: string;
  facility__type: string;
  facility__id: UUID;
  status: string;
  facility__latitude_of_largest_emissions: string;
  facility__longitude_of_largest_emissions: string;
}

export interface FacilityInitialData {
  rows: FacilityRow[];
  row_count: number;
}

export interface FacilitiesSearchParams {
  [key: string]: string | number | undefined | boolean;
  operations_title?: string;
  bcghg_id?: string;
  type?: string;
  status?: string;
  name?: string;
  page?: number;
  sort_field?: string;
  sort_order?: string;
  paginate_results?: boolean;
  end_date?: boolean;
}
