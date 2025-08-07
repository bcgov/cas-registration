import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import { withRuleHasComplianceRouteAccess } from "./withRuleHasComplianceRouteAccess";
import * as constants from "./constants";

import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import getComplianceAccessForCurrentUser from "@/compliance/src/app/utils/getComplianceAccessForCurrentUser";
import { getToken } from "@bciers/actions";

import {
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";

// Mocks
vi.mock("@bciers/actions", () => ({
  getToken: vi.fn(),
}));
vi.mock("@/compliance/src/app/utils/getComplianceAppliedUnits", () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock("@/compliance/src/app/utils/getComplianceAccessForCurrentUser", () => ({
  __esModule: true,
  default: vi.fn(),
}));

// Constants
const DOMAIN = "https://localhost:3000";
const defaultVersionId = 123;

function buildCompliancePath(subRoute: string): string {
  return `/${constants.COMPLIANCE_BASE}/${constants.AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}/${defaultVersionId}/${subRoute}`;
}
const applyPath = buildCompliancePath(
  constants.AppRoutes.APPLY_COMPLIANCE_UNITS,
);
const summariesPath = `/${constants.COMPLIANCE_BASE}/${constants.AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`;

// Helpers
function makeReq(path: string): NextRequest {
  return {
    nextUrl: new NextURL(`${DOMAIN}${path}`),
    url: `${DOMAIN}${path}`,
  } as unknown as NextRequest;
}

vi.spyOn(NextResponse, "redirect");

// Reset between tests
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(constants, "extractComplianceReportVersionId").mockReturnValue(null);
});

// DRY mock setup
function defaultSetup({
  role = mockIndustryUserToken,
  hasAccess = true,
  canApply = true,
  reportId = defaultVersionId,
}: {
  role?: any;
  hasAccess?: boolean;
  canApply?: boolean;
  reportId?: number | null;
} = {}) {
  (getToken as vi.Mock).mockResolvedValue(role);
  (getComplianceAccessForCurrentUser as vi.Mock).mockResolvedValue({
    status: hasAccess ? "Registered" : "Invalid",
  });
  (getComplianceAppliedUnits as vi.Mock).mockResolvedValue({
    can_apply_compliance_units: canApply,
    rows: [],
    row_count: 0,
  });
  vi.spyOn(constants, "extractComplianceReportVersionId").mockReturnValue(
    reportId,
  );
}

// Runner
async function runMiddleware(path: string) {
  const req = makeReq(path);
  const evt = {} as NextFetchEvent;
  const next = vi.fn(() => NextResponse.next());
  const mw = withRuleHasComplianceRouteAccess(next);
  const res = await mw(req, evt);
  return { req, res, next };
}

// ----------------------
// Test Suite
// ----------------------
describe("withRuleHasComplianceRouteAccess middleware", () => {
  it("redirects to /onboarding if compliance access is invalid", async () => {
    defaultSetup({ hasAccess: false });

    const { res } = await runMiddleware(summariesPath);

    expect(res!.status).toBe(307);
    expect(res!.headers.get("location")).toContain(
      constants.AppRoutes.ONBOARDING,
    );
  });

  it("redirects to review summary page when user cannot apply compliance units", async () => {
    defaultSetup({ canApply: false });

    const { res } = await runMiddleware(applyPath);

    expect(res!.status).toBe(307);
    expect(res!.headers.get("location")).toContain(summariesPath);
  });

  it("allows request when all rules pass", async () => {
    defaultSetup();

    const { res, next } = await runMiddleware(applyPath);

    expect(next).toHaveBeenCalled();
    expect(res!.status).toBe(200);
  });

  it("redirects to onboarding if rule validation throws an error", async () => {
    (getComplianceAccessForCurrentUser as vi.Mock).mockImplementation(() => {
      throw new Error("Simulated failure");
    });

    const { res } = await runMiddleware(summariesPath);

    expect(getComplianceAccessForCurrentUser).toHaveBeenCalled();
    expect(res!.status).toBe(307);
    expect(res!.headers.get("location")).toContain(
      constants.AppRoutes.ONBOARDING,
    );
  });

  it("skips rule validation for CAS users", async () => {
    defaultSetup({ role: mockCasUserToken });

    const { res, next } = await runMiddleware("/compliance/any-route");

    expect(next).toHaveBeenCalled();
    expect(res!.status).toBe(200);
  });
});
