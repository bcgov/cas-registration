type UiSchemaMap = {
  [key: number]: string;
};

type EmptyWithUnits = { units: [{ fuels: [{ emissions: [{}] }] }] };
type EmptyWithFuels = { fuels: [{ emissions: [{}] }] };
type EmptyOnlyEmissions = { emissions: [{}] };

type DefaultEmptySourceTypeMap = {
  [key: number]: EmptyWithUnits | EmptyWithFuels | EmptyOnlyEmissions;
};

// Activity ID & matching uiSchema
export const uiSchemaMap: UiSchemaMap = {
  1: "gscUiSchema",
  14: "carbonatesUseUiSchema",
};

const withUnits: EmptyWithUnits = { units: [{ fuels: [{ emissions: [{}] }] }] };
// const withFuels: EmptyWithFuels = { fuels: [{ emissions: [{}] }] };
const onlyEmissions: EmptyOnlyEmissions = { emissions: [{}] };

// Activity ID & matching shape of an empty Source Type
export const defaultEmtpySourceTypeMap: DefaultEmptySourceTypeMap = {
  1: withUnits,
  14: onlyEmissions,
};
