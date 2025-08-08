import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import { withRuleHasComplianceRouteAccess } from "./withRuleHasComplianceRouteAccess";
import * as constants from "./constants";

import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import getUserComplianceAccessStatus from "@/compliance/src/app/utils/getUserComplianceAccessStatus";
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
vi.mock("@/compliance/src/app/utils/getUserComplianceAccessStatus", () => ({
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
  (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
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
    (getUserComplianceAccessStatus as vi.Mock).mockImplementation(() => {
      throw new Error("Simulated failure");
    });

    const { res } = await runMiddleware(summariesPath);

    expect(getUserComplianceAccessStatus).toHaveBeenCalled();
    expect(res!.status).toBe(307);
    expect(res!.headers.get("location")).toContain(
      constants.AppRoutes.ONBOARDING,
    );
  });
  it("allows /review-summary when status is NO_OBLIGATION_OR_EARNED_CREDITS", async () => {
    // Arrange: industry user, status is the exact string used by the rule
    (getToken as vi.Mock).mockResolvedValue(mockIndustryUserToken);
    (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
      status: "No obligation or earned credits",
    });
    (getComplianceAppliedUnits as vi.Mock).mockResolvedValue({
      can_apply_compliance_units: true,
      rows: [],
      row_count: 0,
    });
    // ID extraction isn't critical here, but keep it consistent
    vi.spyOn(constants, "extractComplianceReportVersionId").mockReturnValue(
      defaultVersionId,
    );

    // Path must end with /review-summary to trigger the rule
    const reviewSummaryPath = `/${constants.COMPLIANCE_BASE}/review-summary`;

    // Act
    const { res, next } = await runMiddleware(reviewSummaryPath);

    // Assert
    expect(next).toHaveBeenCalled(); // rule validated successfully, no redirect
    expect(res!.status).toBe(200);
  });

  it("redirects to review summaries when /review-summary but status is not NO_OBLIGATION_OR_EARNED_CREDITS", async () => {
    // Arrange: status that should fail the accessNoObligation rule
    (getToken as vi.Mock).mockResolvedValue(mockIndustryUserToken);
    (getUserComplianceAccessStatus as vi.Mock).mockResolvedValue({
      status: "Registered",
    });
    (getComplianceAppliedUnits as vi.Mock).mockResolvedValue({
      can_apply_compliance_units: true,
      rows: [],
      row_count: 0,
    });
    vi.spyOn(constants, "extractComplianceReportVersionId").mockReturnValue(
      defaultVersionId,
    );

    const reviewSummaryPath = `/${constants.COMPLIANCE_BASE}/review-summary`;

    // Act
    const { res } = await runMiddleware(reviewSummaryPath);

    // Assert: should redirect to the summaries landing path
    expect(res!.status).toBe(307);
    expect(res!.headers.get("location")).toContain(
      `/${constants.COMPLIANCE_BASE}/${constants.AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`,
    );
  });

  it("skips rule validation for CAS users", async () => {
    defaultSetup({ role: mockCasUserToken });

    const { res, next } = await runMiddleware("/compliance/any-route");

    expect(next).toHaveBeenCalled();
    expect(res!.status).toBe(200);
  });
});
