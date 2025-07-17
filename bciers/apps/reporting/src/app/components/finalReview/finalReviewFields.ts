const emissionCategories = [
  { label: "Flaring emissions", key: "emission_categories.flaring" },
  { label: "Fugitive emissions", key: "emission_categories.fugitive" },
  {
    label: "Industrial process emissions",
    key: "emission_categories.industrial_process",
  },
  {
    label: "On-site transportation emissions",
    key: "emission_categories.onsite_transportation",
  },
  {
    label: "Stationary fuel combustion emissions",
    key: "emission_categories.stationary_combustion",
  },
  {
    label: "Venting emissions - useful",
    key: "emission_categories.venting_useful",
  },
  {
    label: "Venting emissions - non-useful",
    key: "emission_categories.venting_non_useful",
  },
  { label: "Emissions from waste", key: "emission_categories.waste" },
  { label: "Emissions from wastewater", key: "emission_categories.wastewater" },
];

const fuelExcludedEmissions = [
  {
    label: "CO2 emissions from excluded woody biomass",
    key: "fuel_excluded.woody_biomass",
  },
  {
    label: "Other emissions from excluded biomass",
    key: "fuel_excluded.excluded_biomass",
  },
  {
    label: "Emissions from excluded non-biomass",
    key: "fuel_excluded.excluded_non_biomass",
  },
];

const otherExcludedEmissions = [
  {
    label:
      "Emissions from line tracing and non-processing and non-compression activities",
    key: "other_excluded.lfo_excluded",
  },
];

const electricityFields = (
  type: "import" | "export",
  sources: "specified" | "unspecified",
) => [
  {
    label: `Amount of ${type}ed electricity - ${sources} sources`,
    key: `${type}_${sources}_electricity`,
    unit: "GWh",
    isDecimal: true,
    decimalPlaces: 3,
  },
  {
    label: `Emissions from ${sources} ${type}s`,
    key: `${type}_${sources}_emissions`,
    unit: "tCO₂e",
    isDecimal: true,
    decimalPlaces: 1,
  },
];

export const operationFields = (isEIO: boolean) => [
  { label: "Report Type", key: "report_type" },
  { label: "Operation Representatives", key: "representatives" },
  { label: "Operator Legal Name", key: "operator_legal_name" },
  { label: "Operator Trade Name", key: "operator_trade_name" },
  { label: "Operation Name", key: "operation_name" },
  { label: "Operation Type", key: "operation_type" },
  { label: "Registration purpose", key: "registration_purpose" },
  { label: "BCGHG ID", key: "operation_bcghgid" },
  ...(isEIO
    ? []
    : [
        { label: "BORO ID", key: "bc_obps_regulated_operation_id" },
        { label: "Reporting activities", key: "activities" },
        { label: "Regulated products", key: "regulated_products" },
      ]),
];

export const personResponsibleFields = [
  { label: "First Name", key: "first_name" },
  { label: "Last Name", key: "last_name" },
  { label: "Job Title / Position", key: "position_title" },
  { label: "Business Email Address", key: "email" },
  { label: "Business Telephone Number", key: "phone_number" },
  { label: "Business Mailing Address", key: "street_address" },
  { label: "Municipality", key: "municipality" },
  { label: "Province", key: "province" },
  { label: "Postal Code", key: "postal_code" },
];

export const additionalDataFields = [
  { label: "Did you capture emissions?", key: "capture_emissions" },
  {
    label: "Emissions (t) captured for on-site use",
    key: "emissions_on_site_use",
  },
  {
    label: "Emissions (t) captured for on-site sequestration",
    key: "emissions_on_site_sequestration",
  },
  {
    label: "Emissions (t) captured for off-site transfer",
    key: "emissions_off_site_transfer",
  },
  { heading: "Additional data" },
  { label: "Electricity Generated", key: "electricity_generated", unit: "GWh" },
];

export const eioFields = [
  ...electricityFields("import", "specified"),
  ...electricityFields("import", "unspecified"),
  ...electricityFields("export", "specified"),
  ...electricityFields("export", "unspecified"),
  {
    label: "Amount of electricity categorized as Canadian Entitlement Power",
    key: "canadian_entitlement_electricity",
    unit: "GWh",
    isDecimal: true,
    decimalPlaces: 3,
  },
  {
    label: "Emissions from Canadian Entitlement Power",
    key: "canadian_entitlement_emissions",
    unit: "tCO₂e",
    isDecimal: true,
    decimalPlaces: 1,
  },
];
export const reportNewEntrantFields = (
  productions: any[],
  reportNewEntrantEmission: any[],
) => {
  const basicEmissions = reportNewEntrantEmission.filter(
    (emission) => emission.category_type === "basic",
  );
  const fuelExcludedEmissionsFields = reportNewEntrantEmission.filter(
    (emission) => emission.category_type === "fuel_excluded",
  );
  const otherExcludedEmissionsFields = reportNewEntrantEmission.filter(
    (emission) => emission.category_type === "other_excluded",
  );

  return [
    {
      label: "Authorization Date",
      key: "authorization_date",
      isDate: true,
    },
    {
      label: "Date of first shipment",
      key: "first_shipment_date",
      isDate: true,
    },
    {
      label: "Date new entrant period began",
      key: "new_entrant_period_start",
      isDate: true,
    },
    { label: "Assertion statement", key: "assertion_statement" },
    ...(productions.flatMap((product, index) => [
      { heading: `Product : ${product.product || `Product ${index + 1}`}` },
      {
        label: "Unit",
        key: `productions.${index}.unit`,
      },
      {
        label: "Production after new entrant period began",
        key: `productions.${index}.production_amount`,
      },
    ]) || []),
    ...(basicEmissions.length > 0
      ? [{ heading: "Emission categories after new entrant period began" }]
      : []),
    ...(basicEmissions.flatMap((emission, index) => [
      {
        label: emission.emission_category,
        key: `report_new_entrant_emission.${index}.emission`,
      },
    ]) || []),
    ...(fuelExcludedEmissionsFields.length > 0
      ? [{ heading: "Emissions excluded by fuel type" }]
      : []),
    ...(fuelExcludedEmissionsFields.flatMap((emission, index) => [
      {
        label: emission.emission_category,
        key: `report_new_entrant_emission.${index}.emission`,
      },
    ]) || []),
    ...(otherExcludedEmissionsFields.length > 0
      ? [{ heading: "Other emissions" }]
      : []),
    ...(otherExcludedEmissionsFields.flatMap((emission, index) => [
      {
        label: emission.emission_category,
        key: `report_new_entrant_emission.${index}.emission`,
      },
    ]) || []),
  ];
};
export const complianceSummaryFields = (products: any[] = []) => [
  {
    label: "Emissions attributable for reporting",
    key: "emissions_attributable_for_reporting",
    unit: "tCO2e",
  },
  {
    label: "Reporting-only emissions",
    key: "reporting_only_emissions",
    unit: "tCO2e",
  },
  {
    label: "Emissions attributable for compliance",
    key: "emissions_attributable_for_compliance",
    unit: "tCO2e",
  },
  { label: "Emissions limit", key: "emissions_limit", unit: "tCO2e" },
  { label: "Excess emissions", key: "excess_emissions", unit: "tCO2e" },
  { label: "Credited emissions", key: "credited_emissions", unit: "tCO2e" },

  { heading: "Regulatory values" },
  { label: "Reduction factor", key: "regulatory_values.reduction_factor" },
  { label: "Tightening rate", key: "regulatory_values.tightening_rate" },
  {
    label: "Initial compliance period",
    key: "regulatory_values.initial_compliance_period",
  },
  { label: "Compliance period", key: "regulatory_values.compliance_period" },

  ...(products.flatMap((product, index) => [
    { heading: product.name || `Product ${index + 1}` },
    {
      label: "Annual production",
      key: `products.${index}.annual_production`,
      unit: "production unit",
    },
    {
      label: "Production data for Apr 1 - Dec 31 2024",
      key: `products.${index}.apr_dec_production`,
    },
    {
      label: "Production-weighted average emission intensity",
      key: `products.${index}.emission_intensity`,
      unit: "tCO2e/production unit",
    },
    {
      label: "Allocated industrial process emissions",
      key: `products.${index}.allocated_industrial_process_emissions`,
      unit: "tCO2e",
    },
    {
      label: "Allocated Emissions attributable to compliance",
      key: `products.${index}.allocated_compliance_emissions`,
      unit: "tCO2e",
    },
  ]) || []),
];

export const emissionsSummaryFields = [
  {
    label: "Emissions attributable for reporting",
    key: "attributable_for_reporting",
  },
  {
    label: "Emissions attributable for reporting threshold",
    key: "attributable_for_reporting_threshold",
  },
  { heading: "Emission Categories" },
  ...emissionCategories,
  { heading: "Emissions excluded by fuel type" },
  ...fuelExcludedEmissions,
  { heading: "Other emissions excluded" },
  ...otherExcludedEmissions,
];

export const productionDataFields = (product: any) => [
  { heading: product.product },
  { label: "Unit", key: "unit" },
  { label: "Annual Production", key: "annual_production" },
  {
    label: "Production Data for Apr 1 - Dec 31 2024",
    key: "production_data_apr_dec",
  },
  {
    label: "Production Quantification Methodology",
    key: "production_methodology",
  },
  {
    label:
      "Quantity in storage at the beginning of the compliance period [Jan 1], if applicable",
    key: "storage_quantity_start_of_period",
  },
  {
    label:
      "Quantity in storage at the end of the compliance period [Dec 31], if applicable",
    key: "storage_quantity_end_of_period",
  },
  {
    label:
      "Quantity sold during compliance period [Jan 1 - Dec 31], if applicable",
    key: "quantity_sold_during_period",
  },
  {
    label:
      "Quantity of throughput at point of sale during compliance period [Jan 1 - Dec 31], if applicable",
    key: "quantity_throughput_during_period",
  },
];

export const operationEmissionSummaryFields = [
  {
    label: "Emissions attributable for reporting",
    key: "attributable_for_reporting",
  },
  {
    label: "Emissions attributable for reporting threshold",
    key: "attributable_for_reporting_threshold",
  },
  { heading: "Emission Categories" },
  ...emissionCategories,
  { heading: "Emissions excluded by fuel type" },
  ...fuelExcludedEmissions,
  { heading: "Other emissions excluded" },
  ...otherExcludedEmissions,
];
