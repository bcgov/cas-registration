// withRuleHasComplianceRouteAccess.test.ts
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import { withRuleHasComplianceRouteAccess } from "./withRuleHasComplianceRouteAccess";
import * as constants from "./constants";

import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import getUserComplianceAccessStatus from "@/compliance/src/app/utils/getUserComplianceAccessStatus";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";

import { getToken } from "@bciers/actions";
import { getUserRole } from "@bciers/middlewares";
import { IDP } from "@bciers/utils/src/enums";
import { ComplianceReportVersionStatus } from "./constants";
import { IssuanceStatus } from "@bciers/utils/src/enums";

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
  const mw = withRuleHasComplianceRouteAccess(next);
  const res = await mw(req, evt);
  return { req, res, next };
}

const getPathname = (res?: NextResponse | null) => {
  const loc = res?.headers.get("location");
  return loc ? new URL(loc).pathname : undefined;
};

const reviewSummariesPath = `${BASE}/${constants.AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`;
const crvBase = `${reviewSummariesPath}/${defaultCrvId}`;
const summariesIdBase = `${BASE}/compliance-summaries/${defaultCrvId}`;

const pathForSeg = (seg: string) => `${crvBase}/${seg}`;
const pathUnderSummaries = (seg: string) => `${summariesIdBase}/${seg}`;

// Derived paths
const applyUnitsPath = pathForSeg(
  constants.AppRoutes.MO_APPLY_COMPLIANCE_UNITS,
);
const reviewIssuanceCreditPath = pathUnderSummaries(
  constants.AppRoutes.RI_REVIEW_SUMMARY,
);
const trackStatusPath = pathUnderSummaries(constants.AppRoutes.RI_TRACK_STATUS);
const requestIssuanceCreditPath = pathUnderSummaries(
  constants.AppRoutes.RI_EARNED_CREDITS,
);

// --------------------
// Mock Helpers
// --------------------
const mockComplianceStatus = (status: ComplianceReportVersionStatus) => {
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
  mockComplianceStatus(ComplianceReportVersionStatus.EARNED_CREDITS);
  mockCanApplyComplianceUnits(true);
  mockIssuanceStatus(IssuanceStatus.CREDITS_NOT_ISSUED);
});

// ----------------------
// Tests
// ----------------------
describe("withRuleHasComplianceRouteAccess middleware", () => {
  it("redirects to /onboarding if compliance access is Invalid", async () => {
    mockComplianceStatus("Invalid" as ComplianceReportVersionStatus);
    const { res } = await runMiddleware(reviewSummariesPath);
    expect(res!.status).toBe(307);
    expect(getPathname(res)).toBe(`/${constants.AppRoutes.ONBOARDING}`);
  });

  it("allows when access status is defined and not Invalid", async () => {
    mockComplianceStatus("Registered" as ComplianceReportVersionStatus);
    const { next, res } = await runMiddleware(reviewSummariesPath);
    expect(next).toHaveBeenCalledOnce();
    expect(res!.status).toBe(200);
  });

  describe("accessNoObligation", () => {
    const seg =
      constants.routesNoObligation[0] ?? constants.AppRoutes.NO_REVIEW_SUMMARY;

    it("redirects when status !== NO_OBLIGATION_OR_EARNED_CREDITS", async () => {
      mockComplianceStatus(ComplianceReportVersionStatus.OBLIGATION_NOT_MET);
      const { res } = await runMiddleware(`${BASE}/${seg}`);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesPath);
    });

    it("allows when status === NO_OBLIGATION_OR_EARNED_CREDITS", async () => {
      mockComplianceStatus(
        ComplianceReportVersionStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
      );
      const { next, res } = await runMiddleware(`${BASE}/${seg}`);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  describe("accessObligation", () => {
    const seg =
      constants.routesObligation[0] ?? constants.AppRoutes.MO_REVIEW_SUMMARY;

    it("redirects when status !== OBLIGATION_NOT_MET", async () => {
      mockComplianceStatus(ComplianceReportVersionStatus.EARNED_CREDITS);
      const { res } = await runMiddleware(pathForSeg(seg));
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesPath);
    });

    it("allows when status === OBLIGATION_NOT_MET", async () => {
      mockComplianceStatus(ComplianceReportVersionStatus.OBLIGATION_NOT_MET);
      const { next, res } = await runMiddleware(pathForSeg(seg));
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });

    it("redirects when can_apply=false", async () => {
      mockComplianceStatus(ComplianceReportVersionStatus.OBLIGATION_NOT_MET);
      mockCanApplyComplianceUnits(false);
      const { res } = await runMiddleware(applyUnitsPath);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesPath);
    });

    it("allows when can_apply=true", async () => {
      mockComplianceStatus(ComplianceReportVersionStatus.OBLIGATION_NOT_MET);
      mockCanApplyComplianceUnits(true);
      const { next, res } = await runMiddleware(`${applyUnitsPath}/`);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  describe("accessEarnedCredits", () => {
    const seg =
      constants.routesEarnedCredits[0] ?? constants.AppRoutes.RI_REVIEW_SUMMARY;

    it("redirects when status !== EARNED_CREDITS", async () => {
      mockComplianceStatus(ComplianceReportVersionStatus.OBLIGATION_NOT_MET);
      const { res } = await runMiddleware(pathForSeg(seg));
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesPath);
    });

    it("allows when status === EARNED_CREDITS", async () => {
      mockComplianceStatus(ComplianceReportVersionStatus.EARNED_CREDITS);
      const { next, res } = await runMiddleware(pathForSeg(seg));
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  describe("track-status-of-issuance → request-issuance redirect logic", () => {
    it.each([
      IssuanceStatus.CREDITS_NOT_ISSUED,
      IssuanceStatus.CHANGES_REQUIRED,
    ])("redirects when issuance_status = %s", async (status) => {
      mockComplianceStatus(ComplianceReportVersionStatus.EARNED_CREDITS);
      mockIssuanceStatus(status);
      const { res } = await runMiddleware(trackStatusPath);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(requestIssuanceCreditPath);
    });

    it("allows staying on track-status when issuance_status = ISSUANCE_REQUESTED", async () => {
      mockComplianceStatus(ComplianceReportVersionStatus.EARNED_CREDITS);
      mockIssuanceStatus(IssuanceStatus.ISSUANCE_REQUESTED);
      const { next, res } = await runMiddleware(`${trackStatusPath}/`);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  // describe("earned-credits > review-summary → redirects to track-status", () => {
  //   it.each([
  //     IssuanceStatus.ISSUANCE_REQUESTED,
  //     IssuanceStatus.APPROVED,
  //     IssuanceStatus.DECLINED,
  //   ])(
  //     "redirects when on review summary and issuance_status = %s",
  //     async (status) => {
  //       mockComplianceStatus(ComplianceReportVersionStatus.EARNED_CREDITS);
  //       mockIssuanceStatus(status);

  //       const { res } = await runMiddleware(reviewIssuanceCreditPath);

  //       expect(res!.status).toBe(307);
  //       expect(getPathname(res)).toBe(trackStatusPath);
  //     },
  //   );

  //   it.each([
  //     IssuanceStatus.CREDITS_NOT_ISSUED,
  //     IssuanceStatus.CHANGES_REQUIRED,
  //   ])(
  //     "allows staying on review-summary when issuance_status = %s",
  //     async (status) => {
  //       mockComplianceStatus(ComplianceReportVersionStatus.EARNED_CREDITS);
  //       mockIssuanceStatus(status);

  //       const { next, res } = await runMiddleware(
  //         `${reviewIssuanceCreditPath}/`,
  //       );
  //       expect(next).toHaveBeenCalledOnce();
  //       expect(res!.status).toBe(200);
  //     },
  //   );
  // });

  describe("bypass & edge flows", () => {
    it("skips middleware when no CRV id", async () => {
      vi.spyOn(constants, "extractComplianceReportVersionId").mockReturnValue(
        null,
      );
      const { next, res } = await runMiddleware(`${BASE}/some-path`);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });

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
