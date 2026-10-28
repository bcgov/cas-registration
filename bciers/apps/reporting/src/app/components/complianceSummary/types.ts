export type ComplianceSummaryFormProduct = {
  name: string;
  annual_production: string;
  jan_mar_production?: string;
  apr_dec_production?: string;
  unit: string;
  emission_intensity: string;
  allocated_industrial_process_emissions: string;
  allocated_compliance_emissions: string;
  allocated_for_compliance_annual: string;
  reduction_factor: string;
  tightening_rate: string;
};

export type ProductionPeriod = "annual" | "apr_dec" | "jan_mar";

export type EafcEmissionRow = {
  activity: string;
  source_type: string;
  fuel_name?: string;
  emissions: string;
};

export type EafcUnregulatedProductRow = {
  product_name: string;
  allocated_emissions: string;
};

export type EafcTotals = {
  attributable_for_reporting: string;
  excluded_by_fuels: string;
  non_useful_venting: string;
  fugitive: string;
  remaining_npnc: string;
  allocated_to_unregulated_products: string;
  annual_eafc: string;
  attributable_for_reporting_rows: EafcEmissionRow[];
  excluded_by_fuels_rows: EafcEmissionRow[];
  non_useful_venting_rows: EafcEmissionRow[];
  fugitive_rows: EafcEmissionRow[];
  remaining_npnc_rows: EafcEmissionRow[];
  unregulated_product_rows: EafcUnregulatedProductRow[];
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
  production_period: ProductionPeriod;
  is_new_entrant: boolean;
  eafc_totals: EafcTotals;
  reporting_year: number;
};
