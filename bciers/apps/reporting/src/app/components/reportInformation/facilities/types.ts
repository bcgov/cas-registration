export interface FacilityReportSearchParams {
  [key: string]: string | number | undefined;
  facility_name?: string;
  facility_bcghgid?: string;
}

export interface FacilityRow {
  id: number;
  facility_id: number;
  facility_bcghgid: string;
  facility_name: string;
  is_completed: boolean;
}
