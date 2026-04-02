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

export type ComplianceSummaryFormPayload = {
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
};
