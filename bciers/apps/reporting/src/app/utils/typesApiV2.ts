export type FacilityData = {
  facility_type: string;
  facility_name: string;
};

export type ReportData = {
  reporting_year: number;
  report_version_id: number;
};

export type OperationData = {
  naics_code: string;
  operation_type: string;
};

export type ReportingFormResponse<TPayload> = {
  report_data: ReportData;
  payload: TPayload;
  facility_data?: FacilityData;
  operation_data?: OperationData;
};
