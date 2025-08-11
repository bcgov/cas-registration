import { NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";

import { withRuleHasComplianceRouteAccessIDIR } from "./withRuleHasComplianceRouteAccessIDIR";
import * as constants from "./constants";
import { IDP, IssuanceStatus } from "@bciers/utils/src/enums";

import { getToken } from "@bciers/actions";
import { getUserRole } from "@bciers/middlewares";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";

// ─────────────────────────────────────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const DOMAIN = "https://localhost:3000";
const BASE = `/${constants.COMPLIANCE_BASE}`;
const HUB = `${BASE}/${constants.AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`;
const CRV_ID = 123;

const pathFor = (seg: string) => `${HUB}/${CRV_ID}/${seg}`;

const PATH_REVIEW_SUMMARY = pathFor(constants.AppRoutes.RI_REVIEW_SUMMARY);
const PATH_REVIEW_DIRECTOR = pathFor(constants.AppRoutes.REVIEW_BY_DIRECTOR);
const PATH_REVIEW_CREDITS = pathFor(
  constants.AppRoutes.RI_REVIEW_SUMMARY_CREDITS,
);
const PATH_TRACK = pathFor(constants.AppRoutes.RI_TRACK_STATUS);

const toReviewSummary = () => PATH_REVIEW_SUMMARY;
const toTrack = () => PATH_TRACK;
const toCredits = () => PATH_REVIEW_CREDITS;
const toDirector = () => PATH_REVIEW_DIRECTOR;

function makeReq(path: string): NextRequest {
  return {
    nextUrl: new NextURL(`${DOMAIN}${path}`),
    url: `${DOMAIN}${path}`,
  } as unknown as NextRequest;
}

async function runMiddleware(path: string) {
  const req = makeReq(path);
  const next = vi.fn(() => NextResponse.next());
  const mw = withRuleHasComplianceRouteAccessIDIR(next);
  const res = await mw(req, {} as any);
  return { res, next };
}

const getPathname = (res?: NextResponse | null) => {
  const loc = res?.headers.get("location");
  return loc ? new URL(loc).pathname : undefined;
};

// Keep ID extraction simple & deterministic for tests
beforeEach(() => {
  vi.clearAllMocks();
  (getToken as vi.Mock).mockResolvedValue({ sub: "u" });
  (getUserRole as vi.Mock).mockReturnValue(IDP.IDIR);
  vi.spyOn(constants, "extractComplianceReportVersionId").mockImplementation(
    (pathname: string) => {
      const m = pathname.match(/\/compliance-summaries\/(\d+)/);
      return m ? Number(m[1]) : null;
    },
  );
});

// Convenience mock
const mockIssuance = (
  status: IssuanceStatus,
  analyst_suggestion?: string | null,
) => {
  (getRequestIssuanceComplianceSummaryData as vi.Mock).mockResolvedValue({
    issuance_status: status,
    analyst_suggestion,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────
describe("withRuleHasComplianceRouteAccessIDIR", () => {
  // ── accessReviewSummary (/request-issuance-review-summary)
  describe("accessReviewSummary", () => {
    it("redirects to TRACK when status is APPROVED", async () => {
      mockIssuance(IssuanceStatus.APPROVED, "ok");
      const { res } = await runMiddleware(`${PATH_REVIEW_SUMMARY}/`);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(toTrack());
    });

    it("redirects to TRACK when status is DECLINED", async () => {
      mockIssuance(IssuanceStatus.DECLINED, "no");
      const { res } = await runMiddleware(PATH_REVIEW_SUMMARY);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(toTrack());
    });

    it("allows when not finalized (e.g., CHANGES_REQUIRED)", async () => {
      mockIssuance(IssuanceStatus.CHANGES_REQUIRED, "revise");
      const { next, res } = await runMiddleware(PATH_REVIEW_SUMMARY);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  // ── accessReviewDirector (/review-by-director)
  describe("accessReviewDirector", () => {
    it("redirects to REVIEW_SUMMARY when status is CREDITS_NOT_ISSUED", async () => {
      mockIssuance(IssuanceStatus.CREDITS_NOT_ISSUED, "n/a");
      const { res } = await runMiddleware(`${PATH_REVIEW_DIRECTOR}/`);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(toReviewSummary());
    });

    it("redirects to TRACK when status is APPROVED", async () => {
      mockIssuance(IssuanceStatus.APPROVED, "approve");
      const { res } = await runMiddleware(PATH_REVIEW_DIRECTOR);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(toTrack());
    });

    it("redirects to TRACK when status is DECLINED", async () => {
      mockIssuance(IssuanceStatus.DECLINED, "decline");
      const { res } = await runMiddleware(PATH_REVIEW_DIRECTOR);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(toTrack());
    });

    it("redirects to REVIEW_SUMMARY_CREDITS when analyst_suggestion is missing", async () => {
      mockIssuance(IssuanceStatus.ISSUANCE_REQUESTED, undefined);
      const { res } = await runMiddleware(PATH_REVIEW_DIRECTOR);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(toCredits());
    });

    it("allows when suggestion present and status not handled (e.g., ISSUANCE_REQUESTED)", async () => {
      mockIssuance(IssuanceStatus.ISSUANCE_REQUESTED, "proceed");
      const { next, res } = await runMiddleware(PATH_REVIEW_DIRECTOR);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  // ── accessReviewCredits (/review-credits-issuance-request)
  describe("accessReviewCredits", () => {
    it("redirects to REVIEW_SUMMARY when status is CREDITS_NOT_ISSUED", async () => {
      mockIssuance(IssuanceStatus.CREDITS_NOT_ISSUED, "n/a");
      const { res } = await runMiddleware(`${PATH_REVIEW_CREDITS}/`);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(toReviewSummary());
    });

    it("redirects to TRACK when status is APPROVED", async () => {
      mockIssuance(IssuanceStatus.APPROVED, "ok");
      const { res } = await runMiddleware(PATH_REVIEW_CREDITS);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(toTrack());
    });

    it("redirects to TRACK when status is DECLINED", async () => {
      mockIssuance(IssuanceStatus.DECLINED, "no");
      const { res } = await runMiddleware(`${PATH_REVIEW_CREDITS}/`);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(toTrack());
    });

    it("allows when not finalized (e.g., CHANGES_REQUIRED)", async () => {
      mockIssuance(IssuanceStatus.CHANGES_REQUIRED, "revise");
      const { next, res } = await runMiddleware(PATH_REVIEW_CREDITS);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  // ── accessTrackStatusIssuance (/track-status-of-issuance)
  describe("accessTrackStatusIssuance", () => {
    it("redirects to REVIEW_SUMMARY when status is CREDITS_NOT_ISSUED", async () => {
      mockIssuance(IssuanceStatus.CREDITS_NOT_ISSUED, "n/a");
      const { res } = await runMiddleware(PATH_TRACK);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(toReviewSummary());
    });

    it("redirects to REVIEW_BY_DIRECTOR when status is ISSUANCE_REQUESTED", async () => {
      mockIssuance(IssuanceStatus.ISSUANCE_REQUESTED, "ok");
      const { res } = await runMiddleware(`${PATH_TRACK}/`);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(toDirector());
    });

    it("redirects to REVIEW_BY_DIRECTOR when status is CHANGES_REQUIRED", async () => {
      mockIssuance(IssuanceStatus.CHANGES_REQUIRED, "revise");
      const { res } = await runMiddleware(PATH_TRACK);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(toDirector());
    });

    it("allows when status is APPROVED", async () => {
      mockIssuance(IssuanceStatus.APPROVED, "approve");
      const { next, res } = await runMiddleware(PATH_TRACK);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });

    it("allows when status is DECLINED", async () => {
      mockIssuance(IssuanceStatus.DECLINED, "decline");
      const { next, res } = await runMiddleware(PATH_TRACK);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });

  // ── Fallbacks / Bypass
  describe("fallbacks & bypass", () => {
    it("falls back to hub on fetch error", async () => {
      (getRequestIssuanceComplianceSummaryData as vi.Mock).mockRejectedValue(
        new Error("boom"),
      );
      const { res } = await runMiddleware(PATH_REVIEW_DIRECTOR);
      expect(res!.status).toBe(307);
      expect(getPathname(res)).toBe(HUB);
    });

    it("bypasses all rules when user is not IDIR", async () => {
      (getUserRole as vi.Mock).mockReturnValue(IDP.BCEIDBUSINESS);
      mockIssuance(IssuanceStatus.CREDITS_NOT_ISSUED, null);
      const { next, res } = await runMiddleware(PATH_TRACK);
      expect(next).toHaveBeenCalledOnce();
      expect(res!.status).toBe(200);
    });
  });
});
