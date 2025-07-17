// types/reportTypes.ts
export interface ReportOperation {
  activities: string;
  regulated_products: string;
  representatives: string;
  operator_legal_name: string;
  operator_trade_name: string;
  operation_name: string;
  operation_type: string;
  operation_bcghgid: string | null;
  bc_obps_regulated_operation_id: string;
  registration_purpose: string;
}

export interface ReportPersonResponsible {
  first_name: string;
  last_name: string;
  position_title: string;
  business_role: string;
  email: string;
  phone_number: string;
  street_address: string;
  municipality: string;
  province: string;
  postal_code: string;
}

export interface ReportAdditionalData {
  capture_emissions: boolean;
  emissions_on_site_use: string;
  emissions_on_site_sequestration: string;
  emissions_off_site_transfer: string;
  electricity_generated: number;
}

export interface ReportComplianceSummary {
  emissions_attributable_for_reporting: string;
  reporting_only_emissions: string;
  emissions_attributable_for_compliance: string;
  emissions_limit: string;
  excess_emissions: string;
  credited_emissions: string;
  regulatory_values: {
    reduction_factor: string;
    tightening_rate: string;
    initial_compliance_period: number;
    compliance_period: number;
  };
  products: ComplianceProduct[];
}

export interface ComplianceProduct {
  name: string;
  annual_production: number;
  apr_dec_production: number;
  emission_intensity: number;
  allocated_industrial_process_emissions: number;
  allocated_compliance_emissions: number;
}
export interface ReportProduct {
  product: string;
  annual_production: number;
  production_data_apr_dec: number;
  production_methodology: string;
  production_methodology_description: string;
  storage_quantity_start_of_period: string;
  storage_quantity_end_of_period: string;
  quantity_sold_during_period: string;
  quantity_throughput_during_period: string;
}
export interface ReportNonAttributableEmission {
  gas_type: string;
  emission_category: string;
  activity: string;
  source_type: string;
}

export interface EmissionCategories {
  flaring: number;
  fugitive: number;
  industrial_process: number;
  onsite_transportation: number;
  stationary_combustion: number;
  venting_useful: number;
  venting_non_useful: number;
  waste: number;
  wastewater: number;
}

export interface FuelExcluded {
  woody_biomass: number;
  excluded_biomass: number;
  excluded_non_biomass: number;
}
export interface OtherExcluded {
  lfo_excluded: number;
  fog_excluded: number;
}

export interface EmissionSummary {
  attributable_for_reporting: string;
  attributable_for_reporting_threshold: string;
  reporting_only_emission: string;
  emission_categories: EmissionCategories;
  fuel_excluded: FuelExcluded;
  other_excluded: OtherExcluded;
}

export interface FacilityReport {
  facility: string;
  facility_name: string;
  facility_type: string;
  facility_bcghgid: string;
  activity_data: [];
  report_products: ReportProduct[];
  reportnonattributableemissions_records: ReportNonAttributableEmission[];
  emission_summary: EmissionSummary;
  report_emission_allocation: ReportEmissionAllocation;
}
export interface ReportProduct {
  report_product_id: number;
  product_name: string;
  allocated_quantity: number;
}

export interface ReportProductEmissionAllocation {
  emission_category_name: string;
  emission_category_id: number;
  category_type: string;
  emission_total: number;
  products: ReportProduct[];
}
export interface ReportProductEmissionAllocationTotal {
  report_product_id: number;
  product_name: string;
  allocated_quantity: number;
}

export interface ReportNewEntrant {
  authorization_date: string;
  first_shipment_date: string;
  new_entrant_period_start: string;
  assertion_statement: boolean;
  report_new_entrant_emission: [];
  productions: [];
}

export interface ReportEmissionAllocation {
  allocation_methodology: string;
  allocation_other_methodology_description: string;
  facility_total_emissions: number;
  report_product_emission_allocation_totals: ReportProductEmissionAllocationTotal[];
  report_product_emission_allocations: ReportProductEmissionAllocation[];
}
export interface ReportElectricityImportData {
  import_specified_electricity: number;
  import_specified_emissions: number;
  import_unspecified_electricity: number;
  import_unspecified_emissions: number;
  export_specified_electricity: number;
  export_specified_emissions: number;
  export_unspecified_electricity: number;
  export_unspecified_emissions: number;
  canadian_entitlement_electricity: number;
  canadian_entitlement_emissions: number;
}
export interface OperationEmissionSummary {
  attributable_for_reporting: number;
  attributable_for_reporting_threshold: string;
  emission_categories: EmissionCategories;
  fuel_excluded: FuelExcluded;
  other_excluded: OtherExcluded;
}
export interface ReportData {
  report_operation: ReportOperation;
  report_person_responsible: ReportPersonResponsible;
  report_additional_data: ReportAdditionalData;
  report_compliance_summary: ReportComplianceSummary;
  operation_emission_summary: OperationEmissionSummary;
  facility_reports: FacilityReport[];
  is_supplementary_report: boolean;
  report_new_entrant: ReportNewEntrant[];
  report_electricity_import_data: ReportElectricityImportData[];
}
