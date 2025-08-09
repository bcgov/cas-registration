// withRuleHasComplianceRouteAccess.test.ts
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import { withRuleHasComplianceRouteAccess } from "./withRuleHasComplianceRouteAccess";
import * as constants from "./constants";

import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import getUserComplianceAccessStatus from "@/compliance/src/app/utils/getUserComplianceAccessStatus";
import { getToken } from "@bciers/actions";
import { getUserRole } from "@bciers/middlewares";
import { IDP } from "@bciers/utils/src/enums";
import { ComplianceReportVersionStatus } from "./constants";

import {
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";

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

// --------------------
// Test harness
// --------------------
const DOMAIN = "https://localhost:3000";
const BASE = `/${constants.COMPLIANCE_BASE}`;
const defaultCrvId = 123;

const getPathname = (res?: NextResponse | null) => {
  const loc = res?.headers.get("location");
  return loc ? new URL(loc).pathname : undefined;
};

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

// Build paths used by rules (path-only strings)
const reviewSummariesPath = `${BASE}/${constants.AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`;
const crvBase = `${reviewSummariesPath}/${defaultCrvId}`;
const pathForSeg = (seg: string) => `${crvBase}/${seg}`;
const applyUnitsPath = pathForSeg(constants.AppRoutes.APPLY_COMPLIANCE_UNITS);

// --------------------
// Setup
// --------------------
beforeEach(() => {
  vi.clearAllMocks();

  // Role: industry (so middleware runs)
  (getToken as vi.Mock).mockResolvedValue(mockIndustryUserToken);
  (getUserRole as vi.Mock).mockReturnValue(IDP.BCEIDBUSINESS);

  // Extract CRV id from path by default
  vi.spyOn(constants, "extractComplianceReportVersionId").mockImplementation(
    (pathname: string) => {
      const m = pathname.match(/\/compliance-summaries\/(\d+)/);
      return m ? Number(m[1]) : null;
    },
  );

  // Default OK responses
  (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
    status: ComplianceReportVersionStatus.OBLIGATION_NOT_MET,
  });
  (getComplianceAppliedUnits as vi.Mock).mockResolvedValue({
    can_apply_compliance_units: true,
    rows: [],
    row_count: 0,
  });
});

// ----------------------
// Tests
// ----------------------
describe("withRuleHasComplianceRouteAccess middleware", () => {
  // accessComplianceRoute
  it("redirects to /onboarding if compliance access is Invalid", async () => {
    (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
      status: "Invalid",
    });

    const { res } = await runMiddleware(reviewSummariesPath);

    expect(res!.status).toBe(307);
    expect(getPathname(res)).toBe(`/${constants.AppRoutes.ONBOARDING}`);
  });

  it("allows when status is defined and not Invalid", async () => {
    (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
      status: "Registered",
    });

    const { next, res } = await runMiddleware(reviewSummariesPath);

    expect(next).toHaveBeenCalledOnce();
    expect(res!.status).toBe(200);
  });

  // accessObligation
  describe("accessObligation", () => {
    const obligationSeg =
      constants.routesObligation[0] ??
      constants.AppRoutes.MANAGE_OBLIGATION_REVIEW_SUMMARY;

    it("redirects when status !== OBLIGATION_NOT_MET", async () => {
      (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
        status: ComplianceReportVersionStatus.EARNED_CREDITS,
      });

      const { res } = await runMiddleware(pathForSeg(obligationSeg));

      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesPath);
    });

    it("allows when status === OBLIGATION_NOT_MET", async () => {
      (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
        status: ComplianceReportVersionStatus.OBLIGATION_NOT_MET,
      });

      const { next, res } = await runMiddleware(pathForSeg(obligationSeg));

      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });

    it("APPLY_COMPLIANCE_UNITS: redirects when can_apply=false", async () => {
      (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
        status: ComplianceReportVersionStatus.OBLIGATION_NOT_MET,
      });
      (getComplianceAppliedUnits as vi.Mock).mockResolvedValue({
        can_apply_compliance_units: false,
      });

      const { res } = await runMiddleware(applyUnitsPath);

      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesPath);
    });

    it("APPLY_COMPLIANCE_UNITS: allows when can_apply=true", async () => {
      (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
        status: ComplianceReportVersionStatus.OBLIGATION_NOT_MET,
      });
      (getComplianceAppliedUnits as vi.Mock).mockResolvedValue({
        can_apply_compliance_units: true,
      });

      const { next, res } = await runMiddleware(`${applyUnitsPath}/`);

      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  // accessEarnedCredits
  describe("accessEarnedCredits", () => {
    const seg =
      constants.routesEarnedCredits[0] ?? "request-issuance-review-summary";

    it("redirects when status !== EARNED_CREDITS", async () => {
      (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
        status: ComplianceReportVersionStatus.OBLIGATION_NOT_MET,
      });

      const { res } = await runMiddleware(pathForSeg(seg));

      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesPath);
    });

    it("allows when status === EARNED_CREDITS", async () => {
      (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
        status: ComplianceReportVersionStatus.EARNED_CREDITS,
      });

      const { next, res } = await runMiddleware(pathForSeg(seg));

      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  // accessNoObligation
  describe("accessNoObligation", () => {
    const seg =
      constants.routesNoObligation[0] ??
      constants.NoObligationRoutes.REVIEW_SUMMARY;

    it("redirects when status !== NO_OBLIGATION_OR_EARNED_CREDITS", async () => {
      (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
        status: ComplianceReportVersionStatus.OBLIGATION_NOT_MET,
      });

      const { res } = await runMiddleware(`${BASE}/${seg}`);

      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(reviewSummariesPath);
    });

    it("allows when status === NO_OBLIGATION_OR_EARNED_CREDITS", async () => {
      (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
        status: ComplianceReportVersionStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
      });

      const { next, res } = await runMiddleware(`${BASE}/${seg}`);

      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  // Bypass & edges
  describe("bypass & edge flows", () => {
    it("skips middleware when no CRV id", async () => {
      vi.spyOn(constants, "extractComplianceReportVersionId").mockReturnValue(
        null,
      );
      const { next, res } = await runMiddleware(`${BASE}/some-path`);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });

    it("bypasses for IDIR (CAS) users", async () => {
      (getUserRole as vi.Mock).mockReturnValue(IDP.IDIR);
      const { next, res } = await runMiddleware(applyUnitsPath);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });

    it("fallback redirect to onboarding on error", async () => {
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
