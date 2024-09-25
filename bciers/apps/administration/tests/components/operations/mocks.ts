const getOperation = vi.fn();
const getOperationWithDocuments = vi.fn();
const getNaicsCodes = vi.fn();
const getReportingActivities = vi.fn();
const getBusinessStructures = vi.fn();
const getRegulatedProducts = vi.fn();
const getRegistrationPurposes = vi.fn();

vi.mock("libs/actions/src/api/getOperation", () => ({
  default: getOperation,
}));

vi.mock("libs/actions/src/api/getOperationWithDocuments", () => ({
  default: getOperationWithDocuments,
}));

vi.mock("libs/actions/src/api/getNaicsCodes", () => ({
  default: getNaicsCodes,
}));

vi.mock("libs/actions/src/api/getReportingActivities", () => ({
  default: getReportingActivities,
}));

vi.mock("libs/actions/src/api/getBusinessStructures", () => ({
  default: getBusinessStructures,
}));

vi.mock("libs/actions/src/api/getRegulatedProducts", () => ({
  default: getRegulatedProducts,
}));

vi.mock("libs/actions/src/api/getRegistrationPurposes", () => ({
  default: getRegistrationPurposes,
}));

export {
  getOperation,
  getOperationWithDocuments,
  getNaicsCodes,
  getReportingActivities,
  getBusinessStructures,
  getRegulatedProducts,
  getRegistrationPurposes,
};
