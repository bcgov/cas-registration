export interface HasReportVersion {
  version_id: number;
}
export interface HasFacilityId extends HasReportVersion {
  facility_id: string;
}
export interface SearchParams {
  [key: string]: string | number | boolean | undefined;
  page?: number;
  sort_field?: string;
  sort_order?: string;
  paginate_results?: boolean;
}
