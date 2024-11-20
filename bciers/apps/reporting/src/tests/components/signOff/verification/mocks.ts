import { vi } from "vitest";

// Create the mock functions
const createVerificationSchema = vi.fn();
const getReportFacilityList = vi.fn();

// Link the module to the import path in the component so to override the real function.
vi.mock(
  "apps/reporting/src/app/components/signOff/verification/createVerificationSchema",
  () => ({
    default: createVerificationSchema,
  }),
);
vi.mock("apps/reporting/src/app/utils/getReportFacilityList", () => ({
  default: getReportFacilityList,
}));

export { createVerificationSchema, getReportFacilityList };
