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
  handleInternalAccessRequest,
  useSessionRole,
  getSessionRole,
  getSession,
  useContext,
  captureException,
  signIn,
  archiveContact,
  getElicensingInvoices,
  getContact,
} from "./mocks";

declare module "vitest" {
  interface Assertion<T = any>
    extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {}
}

// Extend the global expect object with the custom matchers from jest-dom
expect.extend(matchers);

vi.mock("react", async () => {
  const actualReact = await vi.importActual<typeof import("react")>("react");
  return {
    ...actualReact,
    useContext: useContext,
  };
});

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
  getSession,
  signIn,
}));

vi.mock("next-auth", () => ({
  default: vi.fn(),
  auth,
}));

vi.mock("@/dashboard/auth", () => ({
  auth,
}));

// Mock the Sentry module to avoid actual error logging during tests
vi.mock("@sentry/nextjs", () => ({
  captureException,
}));

vi.mock("@bciers/utils/src/sessionUtils", () => ({
  useSessionRole,
  getSessionRole,
}));

vi.mock("@bciers/actions", () => ({
  actionHandler,
  getToken,
}));

vi.mock("@bciers/actions/api/archiveContact", () => ({
  default: archiveContact,
}));

vi.mock("@bciers/actions/api/getOperation", () => ({
  default: getOperation,
}));

vi.mock("@bciers/actions/api/getOperationWithDocuments", () => ({
  default: getOperationWithDocuments,
}));

vi.mock("@bciers/actions/api/getNaicsCodes", () => ({
  default: getNaicsCodes,
}));

vi.mock("@bciers/actions/api/getReportingActivities", () => ({
  default: getReportingActivities,
}));

vi.mock("@bciers/actions/api/getRegulatedProducts", () => ({
  default: getRegulatedProducts,
}));

vi.mock("@bciers/actions/api/getRegistrationPurposes", () => ({
  default: getRegistrationPurposes,
}));

vi.mock("@bciers/actions/api/getBusinessStructures", () => ({
  default: getBusinessStructures,
}));

vi.mock("@bciers/actions/api/fetchOperationsPageData", () => ({
  default: fetchOperationsPageData,
}));

vi.mock("@bciers/actions/api/getContact", () => ({
  default: getContact,
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
vi.mock("@bciers/actions/api/getCurrentUsersOperations", () => ({
  default: getCurrentUsersOperations,
}));

vi.mock("@bciers/actions/api/handleInternalAccessRequest", () => ({
  default: handleInternalAccessRequest,
}));

vi.mock("apps/compliance/src/app/utils/getElicensingInvoices.ts", () => ({
  getElicensingInvoices,
}));

// mock fetch
type FetchMock = ReturnType<typeof vi.fn> & {
  mockResponseOnce(body: string, init?: ResponseInit): void;
  mockResponse(body: string, init?: ResponseInit): void;
  mockResponses(...responses: Array<[string, ResponseInit?]>): void;
  mockRejectOnce(err: Error): void;
  mockReject(err: Error): void;
};
const _fetchMock = vi.fn() as FetchMock;
vi.stubGlobal("fetch", _fetchMock);
_fetchMock.mockResponseOnce = (body: string, init?: ResponseInit) =>
  _fetchMock.mockResolvedValueOnce(
    new Response(body, { status: 200, ...init }),
  );
_fetchMock.mockResponse = (body: string, init?: ResponseInit) =>
  _fetchMock.mockResolvedValue(new Response(body, { status: 200, ...init }));
_fetchMock.mockResponses = (...responses: Array<[string, ResponseInit?]>) =>
  responses.forEach(([body, init]) =>
    _fetchMock.mockResolvedValueOnce(
      new Response(body, { status: 200, ...init }),
    ),
  );
_fetchMock.mockRejectOnce = (err: Error) =>
  _fetchMock.mockRejectedValueOnce(err);
_fetchMock.mockReject = (err: Error) => _fetchMock.mockRejectedValue(err);
export const fetchMocker = _fetchMock;
