import { vi } from "vitest";

// Create the mock function
export const createVerificationSchema = vi.fn();

// Mock the module to use the exported mock function
vi.mock(
  "@reporting/src/app/components/signOff/verification/createVerificationSchema",
  () => ({
    default: createVerificationSchema,
  }),
);
