const FIELD_KEYS = {
  // Emission categories
  flaring: "emission_categories.flaring",
  fugitive: "emission_categories.fugitive",
  industrialProcess: "emission_categories.industrial_process",
  onsiteTransportation: "emission_categories.onsite_transportation",
  stationaryCombustion: "emission_categories.stationary_combustion",
  ventingUseful: "emission_categories.venting_useful",
  ventingNonUseful: "emission_categories.venting_non_useful",
  waste: "emission_categories.waste",
  wastewater: "emission_categories.wastewater",

  // Fuel excluded
  woodyBiomass: "fuel_excluded.woody_biomass",
  excludedBiomass: "fuel_excluded.excluded_biomass",
  excludedNonBiomass: "fuel_excluded.excluded_non_biomass",

  // Other excluded
  lfoExcluded: "other_excluded.lfo_excluded",

  // Operation fields
  reportType: "report_type",
  operatorLegalName: "operator_legal_name",
  operatorTradeName: "operator_trade_name",
  operationName: "operation_name",
  operationType: "operation_type",
  registrationPurpose: "registration_purpose",
  boroId: "bc_obps_regulated_operation_id",

  // Person responsible
  positionTitle: "position_title",
  phoneNumber: "phone_number",
  streetAddress: "street_address",

  // Additional data
  captureEmissions: "capture_emissions",
  emissionsOnSiteUse: "emissions_on_site_use",
  emissionsOnSiteSequestration: "emissions_on_site_sequestration",
  emissionsOffSiteTransfer: "emissions_off_site_transfer",
  electricityGenerated: "electricity_generated",

  // EIO fields
  canadianEntitlementElectricity: "canadian_entitlement_electricity",
  canadianEntitlementEmissions: "canadian_entitlement_emissions",

  // Compliance summary
  emissionsAttributableForReporting: "emissions_attributable_for_reporting",
  reportingOnlyEmissions: "reporting_only_emissions",
  emissionsAttributableForCompliance: "emissions_attributable_for_compliance",
  emissionsLimit: "emissions_limit",
  excessEmissions: "excess_emissions",
  creditedEmissions: "credited_emissions",

  // Emissions summary
  attributableForReporting: "attributable_for_reporting",
  attributableForReportingThreshold: "attributable_for_reporting_threshold",

  // Production data
  productionMethodology: "production_methodology",
  storageQuantityStart: "storage_quantity_start_of_period",
  storageQuantityEnd: "storage_quantity_end_of_period",
  quantitySold: "quantity_sold_during_period",
  quantityThroughput: "quantity_throughput_during_period",
} as const;

const emissionCategories = [
  { label: "Flaring emissions", key: FIELD_KEYS.flaring },
  { label: "Fugitive emissions", key: FIELD_KEYS.fugitive },
  { label: "Industrial process emissions", key: FIELD_KEYS.industrialProcess },
  {
    label: "On-site transportation emissions",
    key: FIELD_KEYS.onsiteTransportation,
  },
  {
    label: "Stationary fuel combustion emissions",
    key: FIELD_KEYS.stationaryCombustion,
  },
  { label: "Venting emissions - useful", key: FIELD_KEYS.ventingUseful },
  { label: "Venting emissions - non-useful", key: FIELD_KEYS.ventingNonUseful },
  { label: "Emissions from waste", key: FIELD_KEYS.waste },
  { label: "Emissions from wastewater", key: FIELD_KEYS.wastewater },
];

const fuelExcludedEmissions = [
  {
    label: "CO2 emissions from excluded woody biomass",
    key: FIELD_KEYS.woodyBiomass,
  },
  {
    label: "Other emissions from excluded biomass",
    key: FIELD_KEYS.excludedBiomass,
  },
  {
    label: "Emissions from excluded non-biomass",
    key: FIELD_KEYS.excludedNonBiomass,
  },
];

const otherExcludedEmissions = [
  {
    label:
      "Emissions from line tracing and non-processing and non-compression activities",
    key: FIELD_KEYS.lfoExcluded,
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
  },
  {
    label: `Emissions from ${sources} ${type}s`,
    key: `${type}_${sources}_emissions`,
    unit: "tCO₂e",
  },
];

export const operationFields = (isEIO: boolean) => [
  { label: "Report Type", key: FIELD_KEYS.reportType },
  { label: "Operation Representatives", key: "representatives" },
  { label: "Operator Legal Name", key: FIELD_KEYS.operatorLegalName },
  { label: "Operator Trade Name", key: FIELD_KEYS.operatorTradeName },
  { label: "Operation Name", key: FIELD_KEYS.operationName },
  { label: "Operation Type", key: FIELD_KEYS.operationType },
  { label: "Registration purpose", key: FIELD_KEYS.registrationPurpose },
  { label: "BCGHG ID", key: "operation_bcghgid" },
  ...(isEIO
    ? []
    : [
        { label: "BORO ID", key: FIELD_KEYS.boroId },
        { label: "Reporting activities", key: "activities" },
        { label: "Regulated products", key: "regulated_products" },
      ]),
];

export const personResponsibleFields = [
  { label: "First Name", key: "first_name" },
  { label: "Last Name", key: "last_name" },
  { label: "Job Title / Position", key: FIELD_KEYS.positionTitle },
  { label: "Business Email Address", key: "email" },
  { label: "Business Telephone Number", key: FIELD_KEYS.phoneNumber },
  { label: "Business Mailing Address", key: FIELD_KEYS.streetAddress },
  { label: "Municipality", key: "municipality" },
  { label: "Province", key: "province" },
  { label: "Postal Code", key: "postal_code" },
];

export const additionalDataFields = [
  { label: "Did you capture emissions?", key: FIELD_KEYS.captureEmissions },
  {
    label: "Emissions (t) captured for on-site use",
    key: FIELD_KEYS.emissionsOnSiteUse,
  },
  {
    label: "Emissions (t) captured for on-site sequestration",
    key: FIELD_KEYS.emissionsOnSiteSequestration,
  },
  {
    label: "Emissions (t) captured for off-site transfer",
    key: FIELD_KEYS.emissionsOffSiteTransfer,
  },
  { heading: "Additional data" },
  {
    label: "Electricity Generated",
    key: FIELD_KEYS.electricityGenerated,
    unit: "GWh",
  },
];

export const eioFields = [
  ...electricityFields("import", "specified"),
  ...electricityFields("import", "unspecified"),
  ...electricityFields("export", "specified"),
  ...electricityFields("export", "unspecified"),
  {
    label: "Amount of electricity categorized as Canadian Entitlement Power",
    key: FIELD_KEYS.canadianEntitlementElectricity,
    unit: "GWh",
  },
  {
    label: "Emissions from Canadian Entitlement Power",
    key: FIELD_KEYS.canadianEntitlementEmissions,
    unit: "tCO₂e",
  },
];

export const reportNewEntrantFields = (
  productions: any[],
  reportNewEntrantEmission: any[],
) => {
  const emissionsWithIndex = reportNewEntrantEmission.map(
    (emission, index) => ({
      ...emission,
      originalIndex: index,
    }),
  );

  const basicEmissionFields = emissionsWithIndex.filter(
    (emission) => emission.category_type === "basic",
  );
  const fuelExcludedEmissionFields = emissionsWithIndex.filter(
    (emission) => emission.category_type === "fuel_excluded",
  );
  const otherExcludedEmissionFields = emissionsWithIndex.filter(
    (emission) => emission.category_type === "other_excluded",
  );

  return [
    { label: "Authorization Date", key: "authorization_date", isDate: true },
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

    // Production Data
    ...(productions.flatMap((product, index) => [
      { heading: `Product : ${product.product || `Product ${index + 1}`}` },
      { label: "Unit", key: `productions.${index}.unit` },
      {
        label: "Production after new entrant period began",
        key: `productions.${index}.production_amount`,
      },
    ]) || []),

    // Basic Emissions
    ...(basicEmissionFields.length > 0
      ? [{ heading: "Emission categories after new entrant period began" }]
      : []),
    ...basicEmissionFields.map((emission) => ({
      label: emission.emission_category,
      key: `report_new_entrant_emission.${emission.originalIndex}.emission`,
    })),

    // Fuel Excluded Emissions
    ...(fuelExcludedEmissionFields.length > 0
      ? [{ heading: "Emissions excluded by fuel type" }]
      : []),
    ...fuelExcludedEmissionFields.map((emission) => ({
      label: emission.emission_category,
      key: `report_new_entrant_emission.${emission.originalIndex}.emission`,
    })),

    // Other Excluded Emissions
    ...(otherExcludedEmissionFields.length > 0
      ? [{ heading: "Other emissions" }]
      : []),
    ...otherExcludedEmissionFields.map((emission) => ({
      label: emission.emission_category,
      key: `report_new_entrant_emission.${emission.originalIndex}.emission`,
    })),
  ];
};

export const complianceSummaryFields = (products: any[] = []) => {
  return [
    {
      label: "Emissions attributable for reporting",
      key: FIELD_KEYS.emissionsAttributableForReporting,
      unit: "tCO2e",
    },
    {
      label: "Reporting-only emissions",
      key: FIELD_KEYS.reportingOnlyEmissions,
      unit: "tCO2e",
    },
    {
      label: "Emissions attributable for compliance",
      key: FIELD_KEYS.emissionsAttributableForCompliance,
      unit: "tCO2e",
    },
    { label: "Emissions limit", key: FIELD_KEYS.emissionsLimit, unit: "tCO2e" },
    {
      label: "Excess emissions",
      key: FIELD_KEYS.excessEmissions,
      unit: "tCO2e",
    },
    {
      label: "Credited emissions",
      key: FIELD_KEYS.creditedEmissions,
      unit: "tCO2e",
    },

    { heading: "Regulatory values" },

    {
      label: "Initial compliance period",
      key: "regulatory_values.initial_compliance_period",
      isYear: true,
    },
    {
      label: "Compliance period",
      key: "regulatory_values.compliance_period",
      isYear: true,
    },

    ...(products.flatMap((product, index) => {
      const fields: any[] = [
        { heading: product.name || `Product ${index + 1}` },
        {
          label: "Reduction factor",
          key: `products.${index}.reduction_factor`,
        },
        { label: "Tightening rate", key: `products.${index}.tightening_rate` },
        {
          label: "Annual production",
          key: `products.${index}.annual_production`,
          unit: "production unit",
        },
        {
          label: "Production data for Apr 1 - Dec 31 2024",
          key: `products.${index}.apr_dec_production`,
          reporting_years: [2024],
        },
        {
          label: "Production data for Jan 1 - Mar 31 2025",
          key: `products.${index}.jan_mar_production`,
          reporting_years: [2025],
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
      ];
      return fields;
    }) || []),
  ];
};

export const emissionsSummaryFields = [
  {
    label: "Emissions attributable for reporting",
    key: FIELD_KEYS.attributableForReporting,
  },
  {
    label: "Emissions attributable for reporting threshold",
    key: FIELD_KEYS.attributableForReportingThreshold,
  },
  { heading: "Emission Categories" },
  ...emissionCategories,
  { heading: "Emissions excluded by fuel type" },
  ...fuelExcludedEmissions,
  { heading: "Other emissions excluded" },
  ...otherExcludedEmissions,
];

export const productionDataFields = (product: any = []) => {
  return [
    { heading: product.product },
    { label: "Unit", key: "unit" },
    { label: "Annual Production", key: "annual_production" },
    ...(product.production_data_apr_dec !== null &&
    product.production_data_apr_dec !== undefined
      ? [
          {
            label: "Production Data for Apr 1 - Dec 31 2024",
            key: "production_data_apr_dec",
          },
        ]
      : []),
    ...(product.production_data_jan_mar !== null &&
    product.production_data_jan_mar !== undefined
      ? [
          {
            label: "Production Data for Jan 1 - Mar 31 2025",
            key: "production_data_jan_mar",
          },
        ]
      : []),
    {
      label: "Production Quantification Methodology",
      key: FIELD_KEYS.productionMethodology,
    },
    {
      label:
        "Quantity in storage at the beginning of the compliance period [Jan 1], if applicable",
      key: FIELD_KEYS.storageQuantityStart,
    },
    {
      label:
        "Quantity in storage at the end of the compliance period [Dec 31], if applicable",
      key: FIELD_KEYS.storageQuantityEnd,
    },
    {
      label:
        "Quantity sold during compliance period [Jan 1 - Dec 31], if applicable",
      key: FIELD_KEYS.quantitySold,
    },
    {
      label:
        "Quantity of throughput at point of sale during compliance period [Jan 1 - Dec 31], if applicable",
      key: FIELD_KEYS.quantityThroughput,
    },
  ];
};

export const operationEmissionSummaryFields = [
  {
    label: "Emissions attributable for reporting",
    key: FIELD_KEYS.attributableForReporting,
  },
  {
    label: "Emissions attributable for reporting threshold",
    key: FIELD_KEYS.attributableForReportingThreshold,
  },
  { heading: "Emission Categories" },
  ...emissionCategories,
  { heading: "Emissions excluded by fuel type" },
  ...fuelExcludedEmissions,
  { heading: "Other emissions excluded" },
  ...otherExcludedEmissions,
];
