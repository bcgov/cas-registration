// withRuleHasComplianceRouteAccessCAS.test.ts
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import { withRuleHasComplianceRouteAccessCAS } from "./withRuleHasComplianceRouteAccessCAS";
import * as constants from "./constants";

import { getToken } from "@bciers/actions";
import { getUserRole } from "@bciers/middlewares";
import { IDP, IssuanceStatus } from "@bciers/utils/src/enums";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";

// --------------------
// Mocks
// --------------------
vi.mock("@bciers/actions", () => ({ getToken: vi.fn() }));
vi.mock("@bciers/middlewares", async (orig) => {
  const actual = await orig();
  return { ...(actual as object), getUserRole: vi.fn() };
});
vi.mock(
  "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData",
  () => ({
    __esModule: true,
    getRequestIssuanceComplianceSummaryData: vi.fn(),
  }),
);

// --------------------
// Test harness helpers
// --------------------
const DOMAIN = "https://localhost:3000";
const BASE = `/${constants.COMPLIANCE_BASE}`;
const CRV_ID = 123;

function makeReq(path: string): NextRequest {
  return {
    nextUrl: new NextURL(`${DOMAIN}${path}`),
    url: `${DOMAIN}${path}`,
  } as unknown as NextRequest;
}

async function runMiddleware(path: string) {
  const req = makeReq(path);
  const evt = {} as NextFetchEvent;
  const next = vi.fn(() => NextResponse.next());
  const mw = withRuleHasComplianceRouteAccessCAS(next);
  const res = await mw(req, evt);
  return { req, res, next };
}

const getPathname = (res?: NextResponse | null) => {
  const loc = res?.headers.get("location");
  return loc ? new URL(loc).pathname : undefined;
};

// Paths
const reviewSummariesHub = `${BASE}/${constants.AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`;
const directorPath = `${reviewSummariesHub}/${CRV_ID}/${constants.AppRoutes.REVIEW_BY_DIRECTOR}`;
const requestIssuancePath = `${reviewSummariesHub}/${CRV_ID}/${constants.AppRoutes.RI_EARNED_CREDITS}`;
const trackStatusPath = `${reviewSummariesHub}/${CRV_ID}/${constants.AppRoutes.RI_TRACK_STATUS}`;

// --------------------
// Defaults + helpers
// --------------------
const mockIDIR = () => (getUserRole as vi.Mock).mockReturnValue(IDP.IDIR);
const mockBCEID = () =>
  (getUserRole as vi.Mock).mockReturnValue(IDP.BCEIDBUSINESS);

const mockIssuanceSummary = (partial: any) => {
  (getRequestIssuanceComplianceSummaryData as vi.Mock).mockResolvedValue({
    analyst_suggestion: "approve", // sensible default
    issuance_status: IssuanceStatus.ISSUANCE_REQUESTED,
    ...partial,
  });
};

// --------------------
// Setup
// --------------------
beforeEach(() => {
  vi.clearAllMocks();
  (getToken as vi.Mock).mockResolvedValue({} as any);
  mockIDIR();

  // Extract numeric CRV id from any “…/<number>/…” path
  vi.spyOn(constants, "extractComplianceReportVersionId").mockImplementation(
    (pathname: string) => {
      const m = pathname.match(/\/(\d+)(\/|$)/);
      return m ? Number(m[1]) : null;
    },
  );

  // default: ready for director (analyst_suggestion present, non-final status)
  mockIssuanceSummary({});
});

// --------------------
// Tests
// --------------------
describe("withRuleHasComplianceRouteAccessCAS (director review flow)", () => {
  it("bypasses (calls next) for non-IDIR users", async () => {
    mockBCEID(); // middleware only runs its checks for IDIR
    const { next, res } = await runMiddleware(directorPath);
    expect(next).toHaveBeenCalledOnce();
    expect(res!.status).toBe(200);
  });

  describe("accessReviewDirector rule", () => {
    it("allows staying on /review-by-director when analyst_suggestion exists and status is not final", async () => {
      mockIssuanceSummary({
        analyst_suggestion: "approve",
        issuance_status: IssuanceStatus.ISSUANCE_REQUESTED,
      });

      const { next, res } = await runMiddleware(`${directorPath}/`);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });

    it("redirects to request-issuance-of-earned-credits when analyst_suggestion is missing", async () => {
      mockIssuanceSummary({
        analyst_suggestion: null,
        issuance_status: IssuanceStatus.CREDITS_NOT_ISSUED,
      });

      const { res } = await runMiddleware(directorPath);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(requestIssuancePath);
    });

    it("redirects to track-status-of-issuance when issuance_status is APPROVED", async () => {
      mockIssuanceSummary({
        analyst_suggestion: "approve",
        issuance_status: IssuanceStatus.APPROVED,
      });

      const { res } = await runMiddleware(directorPath);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(trackStatusPath);
    });

    it("redirects to track-status-of-issuance when issuance_status is DECLINED", async () => {
      mockIssuanceSummary({
        analyst_suggestion: "reject",
        issuance_status: IssuanceStatus.DECLINED,
      });

      const { res } = await runMiddleware(directorPath);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(trackStatusPath);
    });

    it("falls back to the hub when no CRV id can be extracted", async () => {
      const pathWithoutId = `${reviewSummariesHub}/${constants.AppRoutes.REVIEW_BY_DIRECTOR}`;
      const { res } = await runMiddleware(pathWithoutId);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesHub);
    });

    it("falls back to the hub on data fetch error", async () => {
      (getRequestIssuanceComplianceSummaryData as vi.Mock).mockRejectedValue(
        new Error("boom"),
      );
      const { res } = await runMiddleware(directorPath);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesHub);
    });
  });

  it("redirects to onboarding if the runner throws (top-level catch)", async () => {
    // Force an exception in extractComplianceReportVersionId to hit the catch
    (
      constants.extractComplianceReportVersionId as unknown as vi.Mock
    ).mockImplementationOnce(() => {
      throw new Error("oops");
    });
    const { res } = await runMiddleware(directorPath);
    expect(res!.status).toBe(307);
    expect(getPathname(res)).toBe(`/${constants.AppRoutes.ONBOARDING}`);
  });
});
