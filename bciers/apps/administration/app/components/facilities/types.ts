import { UUID } from "crypto";
import { OperationTypes } from "@bciers/utils/src/enums";

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

export interface FacilityFormData {
  [key: string]: unknown;
  id?: string;
  name?: string;
  type?: string;
  is_current_year?: boolean;
  starting_date?: string;
  bcghg_id?: string;
  street_address?: string;
  municipality?: string;
  province?: string;
  postal_code?: string;
  latitude_of_largest_emissions?: number;
  longitude_of_largest_emissions?: number;
  well_authorization_numbers?: string[];
}

export interface Operation {
  name: string;
  type: OperationTypes;
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
  paginate_result?: boolean;
  end_date?: boolean;
}
