export type ReportData = {
  reporting_year: number;
  report_version_id: number;
};

export type RegulatoryValues = {
  initial_compliance_period: number;
  compliance_period: number;
};

export type ReportProductCompliance = {
  name: string;
  annual_production: number;
  jan_mar_production: number;
  apr_dec_production: number;
  emission_intensity: number;
  allocated_industrial_process_emissions: number;
  allocated_compliance_emissions: number;
  reduction_factor: number;
  tightening_rate: number;
};

export type ComplianceSummaryPayload = {
  emissions_attributable_for_reporting: number;
  reporting_only_emissions: number;
  emissions_attributable_for_compliance: number;
  emissions_limit: number;
  excess_emissions: number;
  credited_emissions: number;
  regulatory_values: RegulatoryValues;
  products: ReportProductCompliance[];
};

export type ComplianceSummaryFormProduct = {
  name: string;
  annual_production: string;
  jan_mar_production?: string;
  apr_dec_production?: string;
  emission_intensity: string;
  allocated_industrial_process_emissions: string;
  allocated_compliance_emissions: string;
  reduction_factor: string;
  tightening_rate: string;
};

export type ComplianceSummaryFormData = {
  emissions_attributable_for_reporting: string;
  reporting_only_emissions: string;
  emissions_attributable_for_compliance: string;
  emissions_limit: string;
  excess_emissions: string;
  credited_emissions: string;
  regulatory_values: {
    initial_compliance_period: string;
    compliance_period: string;
  };
  products: ComplianceSummaryFormProduct[];
  reporting_year: number;
  isOptedOut: boolean;
};

export type FacilityData = {
  facility_type: string;
  facility_name?: string;
  facility_id?: string;
};

export type OperationData = {
  naics_code: string | null;
  operation_type: string;
  operation_opted_out_final_reporting_year?: number | null;
};

export type ReportingFormResponse<TPayload> = {
  report_data: ReportData;
  payload: TPayload;
  facility_data?: FacilityData;
  operation_data?: OperationData;
};

export type ComplianceSummaryResponse =
  ReportingFormResponse<ComplianceSummaryPayload>;
