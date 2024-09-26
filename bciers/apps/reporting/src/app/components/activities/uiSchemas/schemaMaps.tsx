type UiSchemaMap = {
  [key: string]: string;
};

type EmptyWithUnits = { units: [{ fuels: [{ emissions: [{}] }] }] };
type EmptyWithFuels = { fuels: [{ emissions: [{}] }] };
type EmptyOnlyEmissions = { emissions: [{}] };

type DefaultEmptySourceTypeMap = {
  [key: string]: EmptyWithUnits | EmptyWithFuels | EmptyOnlyEmissions;
};

// Activity ID & matching uiSchema
export const uiSchemaMap: UiSchemaMap = {
  gsc_excluding_line_tracing: "gscUiSchema",
  carbonate_use: "carbonatesUseUiSchema",
};

const withUnits: EmptyWithUnits = { units: [{ fuels: [{ emissions: [{}] }] }] };
// const withFuels: EmptyWithFuels = { fuels: [{ emissions: [{}] }] };
const onlyEmissions: EmptyOnlyEmissions = { emissions: [{}] };

// Activity ID & matching shape of an empty Source Type
export const defaultEmtpySourceTypeMap: DefaultEmptySourceTypeMap = {
  gsc_excluding_line_tracing: withUnits,
  carbonate_use: onlyEmissions,
};
