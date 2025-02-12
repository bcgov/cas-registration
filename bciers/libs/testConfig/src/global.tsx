/* eslint-disable import/no-extraneous-dependencies*/
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect, vi } from "vitest";
import {
  actionHandler,
  auth,
  getToken,
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
  useSession,
  notFound,
  // these functions are used in multiple apps
  getOperation,
  getOperationWithDocuments,
  getNaicsCodes,
  getReportingActivities,
  getRegulatedProducts,
  getRegistrationPurposes,
  getBusinessStructures,
  fetchOperationsPageData,
  fetchFacilitiesPageData,
  getFacility,
  getCurrentUsersOperations,
} from "./mocks";
import createFetchMock from "vitest-fetch-mock";

declare module "vitest" {
  interface Assertion<T = any>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}

// Extend the global expect object with the custom matchers from jest-dom
expect.extend(matchers);

vi.mock("next/navigation", () => ({
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
  notFound,
}));

vi.mock("next-auth/react", async () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession,
}));

vi.mock("next-auth", () => ({
  default: vi.fn(),
  auth,
}));

vi.mock("@/dashboard/auth", () => ({
  auth,
}));

vi.mock("@bciers/actions", () => ({
  actionHandler,
  getToken,
}));

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

vi.mock("libs/actions/src/api/fetchOperationsPageData", () => ({
  default: fetchOperationsPageData,
}));

vi.mock(
  "apps/administration/app/components/facilities/fetchFacilitiesPageData",
  () => ({
    default: fetchFacilitiesPageData,
  }),
);

vi.mock("apps/administration/app/components/facilities/getFacility", () => ({
  default: getFacility,
}));
vi.mock("libs/actions/src/api/getCurrentUsersOperations", () => ({
  default: getCurrentUsersOperations,
}));

// mock fetch
export const fetchMocker = createFetchMock(vi);

fetchMocker.enableMocks();
