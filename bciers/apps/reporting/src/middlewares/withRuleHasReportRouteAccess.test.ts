import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { instance, mock, reset, when } from "ts-mockito";
import {
  withRuleHasReportRouteAccess,
  permissionRules,
} from "./withRuleHasReportRouteAccess";
import { getToken } from "@bciers/testConfig/mocks";
import {
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";
import * as constants from "./constants";
import { ELECTRICITY_IMPORT_OPERATION } from "@reporting/src/app/utils/constants";
import { ReportOperationStatus } from "@bciers/utils/src/enums";

const domain = "https://localhost:3000";
const mockedRequest: NextRequest = mock(NextRequest);
const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

vi.spyOn(NextResponse, "redirect");

// Define allowed keys for route mocks.
type RouteMockKey = "reportRoutesSubmitted" | "reportRoutesEIO";

// Helper function for common middleware test setup.
const runMiddlewareTest = async ({
  userToken,
  url,
  fetchResponses = [],
  routeMocks = {} as Partial<Record<RouteMockKey, any>>,
}: {
  userToken: any;
  url: string;
  fetchResponses?: any[];
  routeMocks?: Partial<Record<RouteMockKey, any>>;
}) => {
  // Set user token.
  getToken.mockResolvedValue(userToken);
  // Setup URL.
  const nextUrl = new NextURL(url);
  when(mockedRequest.nextUrl).thenReturn(nextUrl);
  when(mockedRequest.url).thenReturn(domain);
  // Force extractReportVersionId.
  vi.spyOn(constants, "extractReportVersionId").mockReturnValue(123);

  // Chain the fetchResponse mocks.
  const fetchSpy = vi.spyOn(constants, "fetchResponse");
  fetchResponses.forEach((response) => {
    fetchSpy.mockResolvedValueOnce(response);
  });

  // For each provided route mock, assert that the constant matches and override it.
  (Object.keys(routeMocks) as RouteMockKey[]).forEach((key) => {
    // Assert that the actual constant value matches the expected value.
    expect((constants as any)[key]).toEqual(routeMocks[key]);
    // Override the constant using a spy.
    vi.spyOn(constants, key, "get").mockReturnValue(routeMocks[key]);
  });

  const nextMiddleware = vi.fn(() => NextResponse.next());
  const middleware = withRuleHasReportRouteAccess(nextMiddleware);
  const result = await middleware(instance(mockedRequest), mockNextFetchEvent);
  return { nextMiddleware, result };
};

describe("withRuleHasReportRouteAccess middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    reset(mockedRequest);
  });

  // --- Failure tests for all rules ---
  permissionRules.forEach((rule) => {
    it(`redirects industry user when "${rule.name}" validation fails`, async () => {
      const { result } = await runMiddlewareTest({
        userToken: mockIndustryUserToken,
        url: `${domain}/reporting/123/test-path-${rule.name}`,
        fetchResponses: [{}], // Force failure by returning an empty object.
      });
      expect(NextResponse.redirect).toHaveBeenCalledOnce();
      expect(result?.status).toBe(307);
    });
  });

  // --- Passing tests for route rules ---

  it('allows industry user when "routeSubmittedReport" rule passes validation', async () => {
    const { nextMiddleware, result } = await runMiddlewareTest({
      userToken: mockIndustryUserToken,
      url: `${domain}/reporting/reports/123/submitted`,
      fetchResponses: [
        {}, // For routeEIO (skip)
        {}, // For routeSimpleReport (skip)
        { operation_report_status: ReportOperationStatus.SUBMITTED }, // For routeSubmittedReport (pass)
      ],
      routeMocks: {
        reportRoutesSubmitted: ["submitted", "submission"],
      },
    });
    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });

  it('allows industry user when "routeEIO" rule passes validation', async () => {
    const { nextMiddleware, result } = await runMiddlewareTest({
      userToken: mockIndustryUserToken,
      url: `${domain}/reporting/reports/123/review-operation-information`,
      fetchResponses: [
        { registration_purpose: ELECTRICITY_IMPORT_OPERATION }, // For routeEIO (pass)
        {}, // For routeSimpleReport (skip)
        {}, // For routeSubmittedReport (skip)
      ],
      routeMocks: {
        reportRoutesEIO: [
          "review-operation-information",
          "person-responsible",
          "electricity-import-data",
          "final-review",
          "verification",
          "attachments",
          "sign-off",
        ],
      },
    });
    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });

  it("allows CAS user to continue without applying route validation", async () => {
    const { nextMiddleware, result } = await runMiddlewareTest({
      userToken: mockCasUserToken,
      url: `${domain}/reporting/123/restricted/new-entrant`,
    });
    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });
});
