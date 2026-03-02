export type FacilityData = {
  facility_type: string;
  facility_name: string;
};

export type ReportData = {
  reporting_year: number;
  report_version_id: number;
};

export type OperationData = {
  naics_code: string | null;
  operation_type: string;
};
