import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { withRuleHasComplianceRouteAccess } from "./withRuleHasComplianceRouteAccess";
import * as constants from "./constants";
import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import hasRegisteredRegulatedOperationForCurrentUser from "@bciers/actions/api/hasRegisteredRegulatedOperationForCurrentUser";
import { getToken } from "@bciers/actions";
import {
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";

// Mock modules
vi.mock("@bciers/actions", () => ({
  getToken: vi.fn(),
}));
vi.mock(
  "@bciers/actions/api/hasRegisteredRegulatedOperationForCurrentUser",
  () => ({
    __esModule: true,
    default: vi.fn(),
  }),
);
vi.mock("@/compliance/src/app/utils/getComplianceAppliedUnits", () => ({
  __esModule: true,
  default: vi.fn(),
}));

const DOMAIN = "https://localhost:3000";
const defaultVersionId = 123;

/**
 * Builds a full compliance path given a subroute
 */
function buildCompliancePath(subRoute: string): string {
  return `/${constants.COMPLIANCE_BASE}/${constants.AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}/${defaultVersionId}/${subRoute}`;
}
const applyPath = buildCompliancePath(
  constants.AppRoutes.APPLY_COMPLIANCE_UNITS,
);
const summariesPath = `/${constants.COMPLIANCE_BASE}/${constants.AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`;

// Helper to build NextRequest
function makeReq(path: string): NextRequest {
  return {
    nextUrl: new NextURL(`${DOMAIN}${path}`),
    url: `${DOMAIN}${path}`,
  } as unknown as NextRequest;
}

vi.spyOn(NextResponse, "redirect");

beforeEach(() => {
  vi.clearAllMocks();

  // Default: industry (BCEID) user
  (getToken as vi.Mock).mockResolvedValue(mockIndustryUserToken);

  // Default: registration check passes
  (hasRegisteredRegulatedOperationForCurrentUser as vi.Mock).mockResolvedValue({
    has_registered_regulated_operation: true,
  });

  // Default: can apply units
  (getComplianceAppliedUnits as vi.Mock).mockResolvedValue({
    can_apply_compliance_units: true,
    rows: [],
    row_count: 0,
  });

  // Default: no version ID
  vi.spyOn(constants, "extractComplianceReportVersionId").mockReturnValue(null);
});

// Helper to run middleware
async function runMiddleware(path: string) {
  const req = makeReq(path);
  const evt = {} as NextFetchEvent;
  const next = vi.fn(() => NextResponse.next());
  const mw = withRuleHasComplianceRouteAccess(next);
  const res = await mw(req, evt);
  return { next, res };
}

describe("withRuleHasComplianceRouteAccess middleware", () => {
  it("redirects to /onboarding if hasRegisteredOperation is false", async () => {
    // Arrange
    (
      hasRegisteredRegulatedOperationForCurrentUser as vi.Mock
    ).mockResolvedValue({
      has_registered_regulated_operation: false,
    });

    // Act
    const { res } = await runMiddleware(
      `/${constants.COMPLIANCE_BASE}/${constants.AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`,
    );

    // Assert
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
    expect(res!.status).toBe(307);

    const expectedRedirect = `/${constants.AppRoutes.ONBOARDING}`;
    expect(res!.headers.get("location")).toContain(expectedRedirect);
  });

  it("redirects to review-summary if can_apply_compliance_units is false", async () => {
    // Arrange
    vi.spyOn(constants, "extractComplianceReportVersionId").mockReturnValue(
      defaultVersionId,
    );
    // Ensure registration check passes
    (
      hasRegisteredRegulatedOperationForCurrentUser as vi.Mock
    ).mockResolvedValue({
      has_registered_regulated_operation: true,
    });
    // Mock units failure
    (getComplianceAppliedUnits as vi.Mock).mockResolvedValue({
      can_apply_compliance_units: false,
      rows: [],
      row_count: 0,
    });

    // Act
    const { res } = await runMiddleware(applyPath);

    // Assert
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
    expect(res!.status).toBe(307);

    const expectedRedirect = summariesPath;
    expect(res!.headers.get("location")).toContain(expectedRedirect);
  });

  it("allows request when all validations pass", async () => {
    // Arrange: positive case with ID present
    vi.spyOn(constants, "extractComplianceReportVersionId").mockReturnValue(
      defaultVersionId,
    );
    (
      hasRegisteredRegulatedOperationForCurrentUser as vi.Mock
    ).mockResolvedValue({
      has_registered_regulated_operation: true,
    });
    (getComplianceAppliedUnits as vi.Mock).mockResolvedValue({
      can_apply_compliance_units: true,
      rows: [
        {
          id: "unit-abc-123",
          type: "ComplianceUnit",
          serial_number: "CU-2025-0001",
          vintage_year: "2025",
          quantity_applied: 100,
          equivalent_value: 1.0,
        },
      ],
      row_count: 1,
    });

    // Act
    const { next, res } = await runMiddleware(applyPath);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(res!.status).toBe(200);
  });

  it("skips rules for non-BCEID users", async () => {
    // Arrange: CAS user
    (getToken as vi.Mock).mockResolvedValue(mockCasUserToken);

    // Act
    const { next, res } = await runMiddleware("/compliance/any-path");

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(res!.status).toBe(200);
  });

  it("redirects to onboarding if checkHasPathAccess throws", async () => {
    // Arrange: throw during hasRegisteredOperation
    vi.spyOn(constants, "extractComplianceReportVersionId").mockReturnValue(
      null,
    );
    (
      hasRegisteredRegulatedOperationForCurrentUser as vi.Mock
    ).mockImplementation(() => {
      throw new Error("Simulated failure");
    });

    // Act
    const { res } = await runMiddleware("/compliance/throws-error");

    // Assert
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
    expect(res!.status).toBe(307);

    const expectedRedirect = `/${constants.AppRoutes.ONBOARDING}`;
    expect(res!.headers.get("location")).toContain(expectedRedirect);
  });
});
