const getOperation = vi.fn();
const getOperationWithDocuments = vi.fn();
const getNaicsCodes = vi.fn();
const getReportingActivities = vi.fn();
const getRegulatedProducts = vi.fn();
const getRegistrationPurposes = vi.fn();
const getBusinessStructures = vi.fn();

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

vi.mock("libs/actions/src/api/getRegulatedProducts", () => ({
  default: getRegulatedProducts,
}));

vi.mock("libs/actions/src/api/getRegistrationPurposes", () => ({
  default: getRegistrationPurposes,
}));

vi.mock("libs/actions/src/api/getBusinessStructures", () => ({
  default: getBusinessStructures,
}));

export {
  getOperation,
  getOperationWithDocuments,
  getNaicsCodes,
  getReportingActivities,
  getRegulatedProducts,
  getRegistrationPurposes,
  getBusinessStructures,
};
