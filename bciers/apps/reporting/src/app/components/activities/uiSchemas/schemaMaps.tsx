type UiSchemaMap = {
  [key: string]: string;
};

type EmptyWithUnits = { units: [{ fuels: [{ emissions: [{}] }] }] };
type EmptyWithFuels = { fuels: [{ emissions: [{}] }] };
type EmptyOnlyEmissions = { emissions: [{}] };

type DefaultEmptySourceTypeMap = {
  [key: string]: EmptyWithUnits | EmptyWithFuels | EmptyOnlyEmissions;
};

// Activity slug & matching uiSchema
export const uiSchemaMap: UiSchemaMap = {
  gsc_excluding_line_tracing: "gscUiSchema",
  gsc_solely_for_line_tracing: "gscUiSchema",
  gsc_other_than_non_compression: "gscOtherThanNonCompression",
  gsc_non_compression: "gscNonCompressionNonProcessingUiSchema",
  fuel_combustion_by_mobile: "fuelCombustionMobileUiSchema",
  hydrogen_production: "hydrogenProduction",
  pulp_and_paper: "pulpAndPaperUiSchema",
  refinery_fuel_gas: "refineryFuelGasUiSchema",
  carbonate_use: "carbonatesUseUiSchema",
};

const withUnits: EmptyWithUnits = { units: [{ fuels: [{ emissions: [{}] }] }] };
const withFuels: EmptyWithFuels = { fuels: [{ emissions: [{}] }] };
const onlyEmissions: EmptyOnlyEmissions = { emissions: [{}] };

// Activity slug & matching shape of an empty Source Type
export const defaultEmtpySourceTypeMap: DefaultEmptySourceTypeMap = {
  gsc_excluding_line_tracing: withUnits,
  gsc_solely_for_line_tracing: withUnits,
  gsc_other_than_non_compression: withUnits,
  gsc_non_compression: withUnits,
  fuel_combustion_by_mobile: withFuels,
  hydrogen_production: onlyEmissions,
  pulp_and_paper: onlyEmissions,
  refinery_fuel_gas: withFuels,
  carbonate_use: onlyEmissions,
};
