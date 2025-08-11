import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import { withRuleHasComplianceRouteAccessBCeID } from "./withRuleHasComplianceRouteAccessBCeID";
import * as constants from "./constants";

import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import getUserComplianceAccessStatus from "@/compliance/src/app/utils/getUserComplianceAccessStatus";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";

import { getToken } from "@bciers/actions";
import { getUserRole } from "@bciers/middlewares";
import { IDP } from "@bciers/utils/src/enums";
import {
  IssuanceStatus,
  ComplianceSummaryStatus,
} from "@bciers/utils/src/enums";

import { mockIndustryUserToken } from "@bciers/testConfig/data/tokens";

// --------------------
// Mocks
// --------------------
vi.mock("@bciers/actions", () => ({ getToken: vi.fn() }));
vi.mock("@bciers/middlewares", async (orig) => {
  const actual = await orig();
  return { ...(actual as object), getUserRole: vi.fn() };
});
vi.mock("@/compliance/src/app/utils/getComplianceAppliedUnits", () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock("@/compliance/src/app/utils/getUserComplianceAccessStatus", () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock(
  "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData",
  () => ({
    __esModule: true,
    getRequestIssuanceComplianceSummaryData: vi.fn(),
  }),
);

// --------------------
// Helpers & Setup
// --------------------
const DOMAIN = "https://localhost:3000";
const BASE = `/${constants.COMPLIANCE_BASE}`;
const defaultCrvId = 123;

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
  const mw = withRuleHasComplianceRouteAccessBCeID(next);
  const res = await mw(req, evt);
  return { req, res, next };
}

const getPathname = (res?: NextResponse | null) => {
  const loc = res?.headers.get("location");
  return loc ? new URL(loc).pathname : undefined;
};

const reviewSummariesPath = `${BASE}/${constants.AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`;
const crvBase = `${reviewSummariesPath}/${defaultCrvId}`;
const summariesIdBase = `${BASE}/${constants.AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}/${defaultCrvId}`;

const pathForSeg = (seg: string) => `${crvBase}/${seg}`;
const pathUnderSummaries = (seg: string) => `${summariesIdBase}/${seg}`;

// Derived paths
const applyUnitsPath = pathForSeg(
  constants.AppRoutes.MO_APPLY_COMPLIANCE_UNITS,
);
const requestIssuanceReviewPath = pathUnderSummaries(
  constants.AppRoutes.RI_REVIEW_SUMMARY,
);
const requestIssuanceCreditPath = pathUnderSummaries(
  constants.AppRoutes.RI_EARNED_CREDITS,
);
const requestIssuanceTrackPath = pathUnderSummaries(
  constants.AppRoutes.RI_TRACK_STATUS,
);

// --------------------
// Mock Helpers
// --------------------
const mockComplianceStatus = (status: ComplianceSummaryStatus) => {
  (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({ status });
};

const mockIssuanceStatus = (status: IssuanceStatus) => {
  (getRequestIssuanceComplianceSummaryData as vi.Mock).mockResolvedValue({
    issuance_status: status,
  });
};

const mockCanApplyComplianceUnits = (canApply: boolean) => {
  (getComplianceAppliedUnits as vi.Mock).mockResolvedValue({
    can_apply_compliance_units: canApply,
    rows: [],
    row_count: 0,
  });
};

// --------------------
// Setup
// --------------------
beforeEach(() => {
  vi.clearAllMocks();

  (getToken as vi.Mock).mockResolvedValue(mockIndustryUserToken);
  (getUserRole as vi.Mock).mockReturnValue(IDP.BCEIDBUSINESS);

  vi.spyOn(constants, "extractComplianceReportVersionId").mockImplementation(
    (pathname: string) => {
      const m = pathname.match(/\/compliance-summaries\/(\d+)/);
      return m ? Number(m[1]) : null;
    },
  );

  // Set defaults
  mockComplianceStatus(ComplianceSummaryStatus.EARNED_CREDITS);
  mockCanApplyComplianceUnits(true);
  mockIssuanceStatus(IssuanceStatus.CREDITS_NOT_ISSUED);
});

// ----------------------
// Tests
// ----------------------
describe("withRuleHasComplianceRouteAccess middleware", () => {
  describe("accessComplianceRoute", () => {
    it("redirects to /onboarding if compliance access is Invalid", async () => {
      mockComplianceStatus("Invalid" as ComplianceSummaryStatus);
      const { res } = await runMiddleware(reviewSummariesPath);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(`/${constants.AppRoutes.ONBOARDING}`);
    });

    it("allows when compliance access status is defined and not Invalid", async () => {
      mockComplianceStatus("Registered" as ComplianceSummaryStatus);
      const { next, res } = await runMiddleware(reviewSummariesPath);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  describe("accessNoObligation", () => {
    it("redirects when status !== NO_OBLIGATION_OR_EARNED_CREDITS", async () => {
      mockComplianceStatus(ComplianceSummaryStatus.OBLIGATION_NOT_MET);
      const { res } = await runMiddleware(
        `${reviewSummariesPath}/${constants.AppRoutes.NO_REVIEW_SUMMARY}`,
      );
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesPath);
    });

    it("allows when status === NO_OBLIGATION_OR_EARNED_CREDITS", async () => {
      mockComplianceStatus(
        ComplianceSummaryStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
      );
      const { next, res } = await runMiddleware(
        `${reviewSummariesPath}/${constants.AppRoutes.NO_REVIEW_SUMMARY}`,
      );
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  describe("accessObligation", () => {
    it("redirects when status !== OBLIGATION_NOT_MET", async () => {
      mockComplianceStatus(ComplianceSummaryStatus.EARNED_CREDITS);
      const { res } = await runMiddleware(
        pathForSeg(constants.routesObligation[0]),
      );
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesPath);
    });

    it("allows when status === OBLIGATION_NOT_MET", async () => {
      mockComplianceStatus(ComplianceSummaryStatus.OBLIGATION_NOT_MET);
      const { next, res } = await runMiddleware(
        pathForSeg(constants.routesObligation[0]),
      );
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });

    it("redirects from apply-compliance-units when can_apply=false", async () => {
      mockComplianceStatus(ComplianceSummaryStatus.OBLIGATION_NOT_MET);
      mockCanApplyComplianceUnits(false);
      const { res } = await runMiddleware(applyUnitsPath);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesPath);
    });

    it("allows from apply-compliance-units when can_apply=true", async () => {
      mockComplianceStatus(ComplianceSummaryStatus.OBLIGATION_NOT_MET);
      mockCanApplyComplianceUnits(true);
      const { next, res } = await runMiddleware(`${applyUnitsPath}/`);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Earned Credits
  // Redirect matrix implemented by the rule
  // ───────────────────────────────────────────────────────────────────────────
  describe("accessEarnedCredits", () => {
    const toTrack = [
      IssuanceStatus.ISSUANCE_REQUESTED,
      IssuanceStatus.APPROVED,
      IssuanceStatus.DECLINED,
    ] as const;

    const toRequest = [
      IssuanceStatus.CREDITS_NOT_ISSUED,
      IssuanceStatus.CHANGES_REQUIRED,
    ] as const;

    it("redirect when status !== EARNED_CREDITS", async () => {
      mockComplianceStatus(ComplianceSummaryStatus.OBLIGATION_NOT_MET);
      mockIssuanceStatus(IssuanceStatus.CREDITS_NOT_ISSUED);
      const { res } = await runMiddleware(`${requestIssuanceReviewPath}/`);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesPath);
    });

    it("allows when status === EARNED_CREDITS", async () => {
      mockComplianceStatus(ComplianceSummaryStatus.EARNED_CREDITS);
      mockIssuanceStatus(IssuanceStatus.CREDITS_NOT_ISSUED);
      const { next, res } = await runMiddleware(
        `${requestIssuanceReviewPath}/`,
      );
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });

    // request-issuance-of-earned-credits -> track-status-of-issuance when issuance ∈ toTrack
    it.each(toTrack)(
      "when status === EARNED_CREDITS redirects from request-issuance-of-earned-credits to track-status-of-issuance if issuance_status = %s",
      async (status) => {
        mockComplianceStatus(ComplianceSummaryStatus.EARNED_CREDITS);
        mockIssuanceStatus(status);

        const { res } = await runMiddleware(`${requestIssuanceCreditPath}/`);
        expect(res!.status).toBe(307);
        expect(getPathname(res)).toBe(requestIssuanceTrackPath);
      },
    );

    // request-issuance-review-summary -> track-status-of-issuance when issuance ∈ toTrack
    it.each(toTrack)(
      "when status === EARNED_CREDITS redirects from request-issuance-review-summary to track-status-of-issuance if issuance_status = %s",
      async (status) => {
        mockComplianceStatus(ComplianceSummaryStatus.EARNED_CREDITS);
        mockIssuanceStatus(status);

        const { res } = await runMiddleware(`${requestIssuanceReviewPath}/`);
        expect(res!.status).toBe(307);
        expect(getPathname(res)).toBe(requestIssuanceTrackPath);
      },
    );

    // track-status-of-issuance to request-issuance-of-earned-credits -> request-issuance-of-earned-credits when issuance ∈ toRequest
    it.each(toRequest)(
      "when status === EARNED_CREDITS redirects from track-status-of-issuance to request-issuance-of-earned-credits if issuance_status = %s",
      async (status) => {
        mockComplianceStatus(ComplianceSummaryStatus.EARNED_CREDITS);
        mockIssuanceStatus(status);

        const { res } = await runMiddleware(`${requestIssuanceTrackPath}/`);
        expect(res!.status).toBe(307);
        expect(getPathname(res)).toBe(requestIssuanceCreditPath);
      },
    );

    // ALLOW cases for Earned Credits flows
    it.each([
      IssuanceStatus.CREDITS_NOT_ISSUED,
      IssuanceStatus.CHANGES_REQUIRED,
    ] as const)(
      "allows request-issuance-of-earned-credits when status === EARNED_CREDITS and issuance_status = %s",
      async (status) => {
        mockComplianceStatus(ComplianceSummaryStatus.EARNED_CREDITS);
        mockIssuanceStatus(status);

        const { next, res } = await runMiddleware(
          `${requestIssuanceCreditPath}/`,
        );
        expect(next).toHaveBeenCalledOnce();
        expect(res!.status).toBe(200);
      },
    );

    it.each([
      IssuanceStatus.ISSUANCE_REQUESTED,
      IssuanceStatus.APPROVED,
      IssuanceStatus.DECLINED,
    ] as const)(
      "allows track-status-of-issuance when status === EARNED_CREDITS and issuance_status = %s",
      async (status) => {
        mockComplianceStatus(ComplianceSummaryStatus.EARNED_CREDITS);
        mockIssuanceStatus(status);

        const { next, res } = await runMiddleware(
          `${requestIssuanceTrackPath}/`,
        );
        expect(next).toHaveBeenCalledOnce();
        expect(res!.status).toBe(200);
      },
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  // redirectPendingInvoice
  // ───────────────────────────────────────────────────────────────────────────
  describe("redirectPendingInvoice", () => {
    it("redirects to summaries when status === OBLIGATION_PENDING_INVOICE_CREATION", async () => {
      mockComplianceStatus(
        ComplianceSummaryStatus.OBLIGATION_PENDING_INVOICE_CREATION,
      );

      const { res } = await runMiddleware(summariesIdBase);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesPath);
    });

    it("does not redirect when status !== OBLIGATION_PENDING_INVOICE_CREATION", async () => {
      mockComplianceStatus(ComplianceSummaryStatus.OBLIGATION_NOT_MET);
      mockCanApplyComplianceUnits(true);

      const { next, res } = await runMiddleware(summariesIdBase);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  describe("bypass & edge flows", () => {
    it("bypasses for IDIR users", async () => {
      (getUserRole as vi.Mock).mockReturnValue(IDP.IDIR);
      const { next, res } = await runMiddleware(applyUnitsPath);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });

    it("redirects to onboarding on error", async () => {
      (getUserComplianceAccessStatus as vi.Mock).mockRejectedValue(
        new Error("boom"),
      );
      const { res } = await runMiddleware(applyUnitsPath);
      expect(res!.status).toBe(307);
      expect(
        getPathname(res)!.endsWith(`/${constants.AppRoutes.ONBOARDING}`),
      ).toBe(true);
    });
  });
});
