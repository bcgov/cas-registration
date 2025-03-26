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
import { REPORTING_OPERATION } from "@reporting/src/app/utils/constants";
import { ReportOperationStatus } from "@bciers/utils/src/enums";

const domain = "https://localhost:3000";
const defaultPath = "/reporting/123/default-path";

// Create a mocked NextRequest and NextFetchEvent
const mockedRequest: NextRequest = mock(NextRequest);
const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

// Spy on NextResponse.redirect
vi.spyOn(NextResponse, "redirect");

// Define allowed keys for route mocks.
type RouteMockKey = "reportRoutesSubmitted" | "reportRoutesReportingOperation";

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
  // Force extractReportVersionId (unless overridden by test)
  vi.spyOn(constants, "extractReportVersionId").mockReturnValue(123);

  // Chain the fetchResponse mocks.
  const fetchSpy = vi.spyOn(constants, "fetchResponse");
  fetchResponses.forEach((response) => {
    fetchSpy.mockResolvedValueOnce(response);
  });

  // For each provided route mock, assert that the constant matches and override it.
  (Object.keys(routeMocks) as RouteMockKey[]).forEach((key) => {
    expect((constants as any)[key]).toEqual(routeMocks[key]);
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
    it(`redirects industry user when "${rule.name}" validation fails (edge: rule returns false)`, async () => {
      const { result } = await runMiddlewareTest({
        userToken: mockIndustryUserToken,
        url: `${domain}/reporting/123/test-path-${rule.name}`,
        fetchResponses: [{}], // Return an empty object to force failure in rule validation.
      });
      expect(NextResponse.redirect).toHaveBeenCalledOnce();
      expect(result?.status).toBe(307);
    });
  });

  // --- Test when extractReportVersionId returns null ---
  it("allows industry user to continue if extractReportVersionId returns null (bypassing route rules)", async () => {
    // Set extractReportVersionId to return null.
    vi.spyOn(constants, "extractReportVersionId").mockReturnValue(null);
    // Ensure the mocked request has a valid nextUrl and url.
    const nextUrl = new NextURL(`${domain}${defaultPath}`);
    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const nextMiddleware = vi.fn(() => NextResponse.next());
    const middleware = withRuleHasReportRouteAccess(nextMiddleware);
    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    // Expect the next middleware to be called since there is no report version to validate.
    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });

  // --- Test when fetchResponse throws an error ---
  it("redirects to onboarding when fetchResponse throws an exception", async () => {
    // Force fetchResponse to throw.
    vi.spyOn(constants, "fetchResponse").mockRejectedValue(
      new Error("API Error"),
    );
    const { result } = await runMiddlewareTest({
      userToken: mockIndustryUserToken,
      url: `${domain}/reporting/123/test-path-error`,
      fetchResponses: [], // No responses needed because it will throw.
    });
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    // Verify redirection to the onboarding page.
    expect(result?.status).toBe(307);
  });

  // --- Passing tests for route rules ---
  it('allows industry user when "routeSubmittedReport" rule passes validation', async () => {
    const { nextMiddleware, result } = await runMiddlewareTest({
      userToken: mockIndustryUserToken,
      url: `${domain}/reporting/reports/123/submitted`,
      fetchResponses: [
        {}, // For any rule that may be skipped.
        {}, // For additional skipped rules.
        { operation_report_status: ReportOperationStatus.SUBMITTED }, // For routeSubmittedReport (pass)
      ],
      routeMocks: {
        reportRoutesSubmitted: ["submitted", "submission"],
      },
    });
    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });

  it('allows industry user when "routeReportingOperation" rule passes validation', async () => {
    const { nextMiddleware, result } = await runMiddlewareTest({
      userToken: mockIndustryUserToken,
      url: `${domain}/reporting/reports/123/review-operation-information`,
      fetchResponses: [
        { registration_purpose: REPORTING_OPERATION }, // For routeReportingOperation (pass)
        {}, // For any additional rule that may be skipped.
        {}, // For another skipped rule.
      ],
      routeMocks: {
        reportRoutesReportingOperation: [
          "review-operation-information",
          "person-responsible",
          "activities",
          "non-attributable",
          "emission-summary",
          "additional-reporting-data",
          "final-review",
          "verification",
          "attachments",
          "sign-off",
          "review-facilities",
          "report-information",
          "review-facility-information",
          "end-of-facility-report",
          "operation-emission-summary",
          "submitted",
          "submission",
        ],
      },
    });
    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });

  it("allows CAS user to continue without applying industry route validation", async () => {
    const { nextMiddleware, result } = await runMiddlewareTest({
      userToken: mockCasUserToken,
      url: `${domain}/reporting/123/restricted/new-entrant`,
    });
    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });
});
