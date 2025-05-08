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

import * as regPurpUtil from "@reporting/src/app/utils/getRegistrationPurpose";
import * as verifyUtil from "@reporting/src/app/utils/getReportNeedsVerification";
import * as suppUtil from "@reporting/src/app/utils/getIsSupplementaryReport";
import * as opUtil from "@reporting/src/app/utils/getReportingOperation";

const domain = "https://localhost:3000";
const defaultPath = "/reporting/123/default-path";

// Create a mocked NextRequest and NextFetchEvent
const mockedRequest: NextRequest = mock(NextRequest);
const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

// Spy on NextResponse.redirect
vi.spyOn(NextResponse, "redirect");

// Define allowed keys for route mocks.
type RouteMockKey =
  | "reportRoutesSubmitted"
  | "reportRoutesReportingOperation"
  | "restrictedRoutesSubmitted"
  | "restrictedSupplementaryReport";

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
    it(`redirects industry user when "${rule.name}" validation fails`, async () => {
      const { result } = await runMiddlewareTest({
        userToken: mockIndustryUserToken,
        url: `${domain}/reporting/123/test-path-${rule.name}`,
        fetchResponses: [{}], // Return an empty object to force failure in rule validation.
      });
      expect(NextResponse.redirect).toHaveBeenCalledOnce();
      expect(result?.status).toBe(307);
    });
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

  describe("EIO route tests (restricted routes)", () => {
    // Invalid response
    const invalidEIOResponse = { registration_purpose: "NOT_EIO" };

    // Loop over each route segment defined in restrictedRoutesEIO.
    constants.restrictedRoutesEIO.forEach((routeSegment) => {
      it(`redirects industry user for EIO route segment '${routeSegment}' when registration purpose is not ELECTRICITY_IMPORT_OPERATION`, async () => {
        // Build a test URL using the current EIO route segment.
        const testUrl = `${domain}/reporting/123/${routeSegment}`;

        // Run the middleware test with an invalid registration purpose.
        // The fetchResponses array supplies a response for the rule's getRegistrationPurpose call.
        const { result } = await runMiddlewareTest({
          userToken: mockIndustryUserToken,
          url: testUrl,
          fetchResponses: [
            invalidEIOResponse, // This response will be used by context.getRegistrationPurpose for the accessEIO rule.
          ],
        });

        // Expect a redirect because the registration purpose does not match ELECTRICITY_IMPORT_OPERATION.
        expect(NextResponse.redirect).toHaveBeenCalledOnce();
        expect(result?.status).toBe(307);
      });
    });
  });

  describe("LFO route segment tests (restricted routes)", () => {
    // Invalid response
    const invalidOperationResponse = { operation_type: "NOT_LFO" };
    // Loop over each LFO route segment
    constants.reportRoutesLFO.forEach((routeSegment) => {
      it(`redirects industry user for LFO route segment '${routeSegment}' when operation type is not LFO`, async () => {
        // Build a test URL with the current LFO segment
        const testUrl = `${domain}/reporting/123/${routeSegment}`;

        // Run the middleware test with an invalid operation type
        const { result } = await runMiddlewareTest({
          userToken: mockIndustryUserToken,
          url: testUrl,
          fetchResponses: [
            invalidOperationResponse, // This will be used by getReportOperation
          ],
        });

        // Expect a redirect because the operation type does not match LFO.
        expect(NextResponse.redirect).toHaveBeenCalledOnce();
        expect(result?.status).toBe(307);
      });
    });
  });

  describe("New Entrant route tests (restricted routes)", () => {
    // Invalid response
    const invalidNewEntrantResponse = {
      registration_purpose: "NOT_NEW_ENTRANT",
    };

    // Loop over each route segment defined in restrictedRoutesNewEntrant.
    constants.restrictedRoutesNewEntrant.forEach((routeSegment) => {
      it(`redirects industry user for New Entrant route segment '${routeSegment}' when registration purpose is not NEW_ENTRANT_REGISTRATION_PURPOSE`, async () => {
        // Build a test URL with the current New Entrant route segment.
        const testUrl = `${domain}/reporting/123/${routeSegment}`;

        // Run the middleware test with an invalid registration purpose.
        // The fetchResponses array supplies a response for the rule's getRegistrationPurpose call.
        const { result } = await runMiddlewareTest({
          userToken: mockIndustryUserToken,
          url: testUrl,
          fetchResponses: [
            invalidNewEntrantResponse, // This response will be used by context.getRegistrationPurpose for the accessNewEntrant rule.
          ],
        });

        // Expect a redirect because the registration purpose does not match NEW_ENTRANT_REGISTRATION_PURPOSE.
        expect(NextResponse.redirect).toHaveBeenCalledOnce();
        expect(result?.status).toBe(307);
      });
    });
  });

  describe("Submitted route tests (restricted routes)", () => {
    // Invalid response
    const invalidSubmittedResponse = {
      operation_report_status: "NOT_SUBMITTED",
    };

    // Loop over each route segment defined in restrictedRoutesSubmitted.
    constants.restrictedRoutesSubmitted.forEach((routeSegment) => {
      it(`redirects industry user for submitted route segment '${routeSegment}' when operation status is not SUBMITTED`, async () => {
        // Build a test URL using the current submitted route segment.
        const testUrl = `${domain}/reporting/123/${routeSegment}`;

        // Run the middleware test with a fetch response simulating a non-submitted operation.
        const { result } = await runMiddlewareTest({
          userToken: mockIndustryUserToken,
          url: testUrl,
          fetchResponses: [
            invalidSubmittedResponse, // This response is used by the rule checking for SUBMITTED status.
          ],
          routeMocks: {
            restrictedRoutesSubmitted: ["submitted", "submission"],
          },
        });

        // Expect a redirect because the operation status is not SUBMITTED.
        expect(NextResponse.redirect).toHaveBeenCalledOnce();
        expect(result?.status).toBe(307);
      });
    });
  });

  describe("Verification route tests (restricted routes)", () => {
    // Invalid response
    const invalidVerificationResponse = false;

    // Define URL variants that should match the verification rule
    const verificationTestUrls = [
      `${domain}/reporting/reports/123/verification`,
    ];

    // For these tests, simulate the fetchResponse call to return a false value
    // which means verification validation fails.
    verificationTestUrls.forEach((testUrl) => {
      it(`redirects industry user when verification check fails for URL "${testUrl}"`, async () => {
        const { result } = await runMiddlewareTest({
          userToken: mockIndustryUserToken,
          url: testUrl,
          fetchResponses: [
            invalidVerificationResponse, // This simulates the API returning a falsy value for needsVerification.
          ],
        });
        // Expect a redirect due to failing validation.
        expect(NextResponse.redirect).toHaveBeenCalledOnce();
        expect(result?.status).toBe(307);
      });
    });
  });

  describe("Supplementary report route tests (restricted routes)", () => {
    // Invalid response
    const invalidIsSupplementaryReportResponse = false;

    // Loop over each route segment defined in restrictedRoutesSubmitted.
    constants.restrictedSupplementaryReport.forEach((routeSegment) => {
      it(`redirects industry user for supplementary route segment '${routeSegment}' when report is NOT supplementary report`, async () => {
        // Build a test URL using the current submitted route segment.
        const testUrl = `${domain}/reporting/123/${routeSegment}`;

        // Run the middleware test with a fetch response simulating a non supplementary report.
        const { result } = await runMiddlewareTest({
          userToken: mockIndustryUserToken,
          url: testUrl,
          fetchResponses: [
            invalidIsSupplementaryReportResponse, // This response is used by the rule checking for is supplementary report.
          ],
          routeMocks: {
            restrictedSupplementaryReport: ["change-review"],
          },
        });

        // Expect a redirect because the report is NOT supplementary report.
        expect(NextResponse.redirect).toHaveBeenCalledOnce();
        expect(result?.status).toBe(307);
      });
    });
  });

  // --- Passing tests for route rules ---

  it("allows industry user to continue if reportVersionId returns null", async () => {
    vi.spyOn(constants, "extractReportVersionId").mockReturnValue(null);
    const nextUrl = new NextURL(`${domain}${defaultPath}`);
    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const nextMiddleware = vi.fn(() => NextResponse.next());
    const middleware = withRuleHasReportRouteAccess(nextMiddleware);
    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });

  it('allows industry user when "routeSubmittedReport" rule passes validation', async () => {
    // Extract version ID
    vi.spyOn(constants, "extractReportVersionId").mockReturnValue(123);

    // Set up request URL
    const nextUrl = new NextURL(`${domain}/reporting/reports/123/submitted`);
    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    // Mock getToken
    getToken.mockResolvedValue(mockIndustryUserToken);

    // Stub the four helpers in the order the rules invoke them:
    //    a) accessSubmitted uses getReportingOperation
    vi.spyOn(opUtil, "getReportingOperation").mockResolvedValue({
      operation_report_status: ReportOperationStatus.SUBMITTED,
    });
    //    b) routeSubmittedReport uses getIsSupplementaryReport
    vi.spyOn(suppUtil, "getIsSupplementaryReport").mockResolvedValue({
      operation_report_status: ReportOperationStatus.SUBMITTED,
    });
    //    c) routeReportingOperation (last in the list) uses getRegistrationPurpose
    vi.spyOn(regPurpUtil, "getRegistrationPurpose").mockResolvedValue({
      registration_purpose: "NOT_REPORTING_OPERATION", // so isApplicable returns false
    });
    //    d) accessVerification uses getReportNeedsVerification (never really called here,
    //       but stub to prevent accidental calls)
    vi.spyOn(verifyUtil, "getReportNeedsVerification").mockResolvedValue(false);

    // Override the route‐list constant
    vi.spyOn(constants, "reportRoutesSubmitted", "get").mockReturnValue([
      "submitted",
      "submission",
    ]);

    // Run middleware
    const nextMiddleware = vi.fn(() => NextResponse.next());
    const middleware = withRuleHasReportRouteAccess(nextMiddleware);
    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    // Assert it flows through
    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });

  it('allows industry user when "routeReportingOperation" rule passes validation', async () => {
    // Extract version ID
    vi.spyOn(constants, "extractReportVersionId").mockReturnValue(123);

    // Set up request URL
    const nextUrl = new NextURL(
      `${domain}/reporting/reports/123/review-operation-information`,
    );

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    // Mock getToken
    getToken.mockResolvedValue(mockIndustryUserToken);

    // Stub the four helpers in the order the rules invoke them:
    //    a) accessSubmitted uses getReportingOperation
    vi.spyOn(opUtil, "getReportingOperation").mockResolvedValue({
      operation_report_status: ReportOperationStatus.DRAFT,
    });
    //    b) routeSubmittedReport uses getIsSupplementaryReport
    vi.spyOn(suppUtil, "getIsSupplementaryReport").mockResolvedValue({
      operation_report_status: ReportOperationStatus.DRAFT,
    });
    //    c) routeReportingOperation (last in the list) uses getRegistrationPurpose
    vi.spyOn(regPurpUtil, "getRegistrationPurpose").mockResolvedValue({
      registration_purpose: REPORTING_OPERATION,
    });
    //    d) accessVerification uses getReportNeedsVerification (never really called here,
    //       but stub to prevent accidental calls)
    vi.spyOn(verifyUtil, "getReportNeedsVerification").mockResolvedValue(false);

    // Override the route‐list constant
    vi.spyOn(constants, "reportRoutesSubmitted", "get").mockReturnValue([
      "submitted",
      "submission",
    ]);

    // Run middleware
    const nextMiddleware = vi.fn(() => NextResponse.next());
    const middleware = withRuleHasReportRouteAccess(nextMiddleware);
    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    // Assert it flows through
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
