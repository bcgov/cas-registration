import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
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
import {
  NEW_ENTRANT_REGISTRATION_PURPOSE,
  REPORTING_OPERATION,
} from "@reporting/src/app/utils/constants";
import { OperationTypes, ReportOperationStatus } from "@bciers/utils/src/enums";
import * as regPurpUtil from "@reporting/src/app/utils/getRegistrationPurpose";
import * as verifyUtil from "@reporting/src/app/utils/getReportVerificationStatus";
import * as suppUtil from "@reporting/src/app/utils/getIsSupplementaryReport";
import * as opUtil from "@reporting/src/app/utils/getReportingOperation";

const DOMAIN = "https://localhost:3000";
const BASE_PATH = "/reporting/123";
const defaultVersionId = 123;

// Minimal stub for NextRequest
function makeReq(path: string): NextRequest {
  return {
    nextUrl: new NextURL(`${DOMAIN}${path}`),
    url: DOMAIN,
  } as unknown as NextRequest;
}

vi.spyOn(NextResponse, "redirect");

beforeEach(() => {
  vi.clearAllMocks();
  getToken.mockResolvedValue(mockIndustryUserToken);
  vi.spyOn(constants, "extractReportVersionId").mockReturnValue(
    defaultVersionId,
  );
});

async function runMiddleware(path: string) {
  const req = makeReq(path);
  const evt = {} as NextFetchEvent;
  const next = vi.fn(() => NextResponse.next());
  const mw = withRuleHasReportRouteAccess(next);
  const res = await mw(req, evt);
  return { next, res };
}

describe("withRuleHasReportRouteAccess - permissionRules", () => {
  it.each(permissionRules.map((r) => r.name))(
    `redirects industry user when "%s" validation fails`,
    async (ruleName) => {
      vi.spyOn(constants, "fetchResponse").mockResolvedValueOnce({});
      const { res } = await runMiddleware(`${BASE_PATH}/test-path-${ruleName}`);
      expect(NextResponse.redirect).toHaveBeenCalledOnce();
      expect(res!.status).toBe(307);
    },
  );
});

it("redirects to onboarding when fetchResponse throws", async () => {
  vi.spyOn(constants, "fetchResponse").mockRejectedValue(
    new Error("API Error"),
  );
  const { res } = await runMiddleware(`${BASE_PATH}/test-path-error`);
  expect(NextResponse.redirect).toHaveBeenCalledOnce();
  expect(res!.status).toBe(307);
});

// Table-driven restricted tests
const restrictedTests: Array<{
  listName: keyof typeof constants;
  invalidResp: any;
  description: string;
  matchUrl: (seg: string) => string;
  mockHelpers: () => void;
}> = [
  {
    listName: "restrictedRoutesEIO",
    invalidResp: { registration_purpose: "NOT_EIO" },
    description: "EIO",
    matchUrl: (seg) => `${BASE_PATH}/${seg}`,
    mockHelpers: () =>
      vi
        .spyOn(regPurpUtil, "getRegistrationPurpose")
        .mockResolvedValue({ registration_purpose: "NOT_EIO" }),
  },
  {
    listName: "reportRoutesLFO",
    invalidResp: { operation_type: "NOT_LFO" },
    description: "LFO",
    matchUrl: (seg) => `${BASE_PATH}/${seg}`,
    mockHelpers: () =>
      vi
        .spyOn(opUtil, "getReportingOperation")
        .mockResolvedValue({ operation_type: "NOT_LFO" }),
  },
  {
    listName: "restrictedRoutesNewEntrant",
    invalidResp: { registration_purpose: "NOT_NEW_ENTRANT" },
    description: "New Entrant",
    matchUrl: (seg) => `${BASE_PATH}/${seg}`,
    mockHelpers: () =>
      vi
        .spyOn(regPurpUtil, "getRegistrationPurpose")
        .mockResolvedValue({ registration_purpose: "NOT_NEW_ENTRANT" }),
  },
  {
    listName: "restrictedRoutesSubmitted",
    invalidResp: { operation_report_status: "NOT_SUBMITTED" },
    description: "Submitted",
    matchUrl: (seg) => `${BASE_PATH}/${seg}`,
    mockHelpers: () =>
      vi
        .spyOn(opUtil, "getReportingOperation")
        .mockResolvedValue({ operation_report_status: "NOT_SUBMITTED" }),
  },
  {
    listName: "restrictedSupplementaryReport",
    invalidResp: false,
    description: "Supplementary",
    matchUrl: (seg) => `${BASE_PATH}/${seg}`,
    mockHelpers: () =>
      vi.spyOn(suppUtil, "getIsSupplementaryReport").mockResolvedValue(false),
  },
];

// turn each entry into a [description, testCase] tuple
const restrictedRows = restrictedTests.map((t) => [t.description, t] as const);

describe.each(restrictedRows)(
  "restricted %s",
  (description, { listName, invalidResp, matchUrl, mockHelpers }) => {
    it.each(constants[listName] as string[])(
      `redirects industry user for ${description} route '%s'`,
      async (segment) => {
        mockHelpers();
        vi.spyOn(constants, "fetchResponse").mockResolvedValueOnce(invalidResp);

        const { res } = await runMiddleware(matchUrl(segment));

        expect(NextResponse.redirect).toHaveBeenCalledOnce();
        expect(res!.status).toBe(307);
      },
    );
  },
);

// Verification tests
describe("restricted Verification > redirects industry user for Verification route'", () => {
  it("redirects when verification check fails", async () => {
    vi.spyOn(verifyUtil, "getReportVerificationStatus").mockResolvedValue(
      false,
    );
    vi.spyOn(constants, "fetchResponse").mockResolvedValueOnce(false);
    const { res } = await runMiddleware(
      `/reporting/reports/${defaultVersionId}/verification`,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(res!.status).toBe(307);
  });
});

describe("allowing flows", () => {
  it("skips middleware when no reportVersionId", async () => {
    vi.spyOn(constants, "extractReportVersionId").mockReturnValue(null);
    const { next, res } = await runMiddleware(BASE_PATH + "/some-path");
    expect(next).toHaveBeenCalledOnce();
    expect(res!.status).toBe(200);
  });

  it("allows industry user for accessLFO when operation_type is LFO", async () => {
    vi.spyOn(opUtil, "getReportingOperation").mockResolvedValue({
      operation_type: OperationTypes.LFO,
    });
    const path = `${BASE_PATH}/${constants.reportRoutesLFO[0]}`;
    const { next, res } = await runMiddleware(path);
    expect(next).toHaveBeenCalledOnce();
    expect(res!.status).toBe(200);
  });

  it("allows industry user for accessNewEntrant when registration purpose is NEW_ENTRANT_REGISTRATION_PURPOSE", async () => {
    vi.spyOn(regPurpUtil, "getRegistrationPurpose").mockResolvedValue({
      registration_purpose: NEW_ENTRANT_REGISTRATION_PURPOSE,
    });
    const path = `${BASE_PATH}/${constants.restrictedRoutesNewEntrant[0]}`;
    const { next, res } = await runMiddleware(path);
    expect(next).toHaveBeenCalledOnce();
    expect(res!.status).toBe(200);
  });

  it("allows industry user for accessSubmitted when operation_report_status is SUBMITTED", async () => {
    vi.spyOn(opUtil, "getReportingOperation").mockResolvedValue({
      operation_report_status: ReportOperationStatus.SUBMITTED,
    });
    const path = `${BASE_PATH}/${constants.restrictedRoutesSubmitted[0]}`;
    const { next, res } = await runMiddleware(path);
    expect(next).toHaveBeenCalledOnce();
    expect(res!.status).toBe(200);
  });

  it("allows industry user for accessVerification when show_verification_page is true", async () => {
    vi.spyOn(verifyUtil, "getReportVerificationStatus").mockResolvedValue({
      show_verification_page: true,
    });
    const path = `/reporting/reports/${defaultVersionId}/verification`;
    const { next, res } = await runMiddleware(path);
    expect(next).toHaveBeenCalledOnce();
    expect(res!.status).toBe(200);
  });

  it("allows industry user for accessSupplementaryReport when isSupplementaryReport is true", async () => {
    vi.spyOn(suppUtil, "getIsSupplementaryReport").mockResolvedValue(true);
    const path = `${BASE_PATH}/${constants.restrictedSupplementaryReport[0]}`;
    const { next, res } = await runMiddleware(path);
    expect(next).toHaveBeenCalledOnce();
    expect(res!.status).toBe(200);
  });

  it("allows routeReportingOperation when registration purpose matches REPORTING_OPERATION and path matches reportRoutesReportingOperation", async () => {
    vi.spyOn(suppUtil, "getIsSupplementaryReport").mockResolvedValue(false);
    vi.spyOn(regPurpUtil, "getRegistrationPurpose").mockResolvedValue({
      registration_purpose: REPORTING_OPERATION,
    });
    const { next, res } = await runMiddleware(
      `/reporting/reports/${defaultVersionId}/${constants.reportRoutesReportingOperation[0]}`,
    );
    expect(next).toHaveBeenCalledOnce();
    expect(res!.status).toBe(200);
  });

  it("allows industry user for routeSubmittedReport when report is actually SUBMITTED and path matches routeRoutesSubmitted", async () => {
    vi.spyOn(suppUtil, "getIsSupplementaryReport").mockResolvedValue({
      operation_report_status: ReportOperationStatus.SUBMITTED,
    });
    const segment = constants.reportRoutesSubmitted[0];
    const path = `${BASE_PATH}/${segment}`;
    const { next, res } = await runMiddleware(path);
    expect(next).toHaveBeenCalledOnce();
    expect(res!.status).toBe(200);
  });

  it("lets CAS user skip all validations", async () => {
    getToken.mockResolvedValue(mockCasUserToken);
    const { next, res } = await runMiddleware(
      `${BASE_PATH}/restricted/new-entrant`,
    );
    expect(next).toHaveBeenCalledOnce();
    expect(res!.status).toBe(200);
  });
});
