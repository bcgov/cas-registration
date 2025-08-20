import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory, getUserRole } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import { IDP, IssuanceStatus } from "@bciers/utils/src/enums";

import {
  AppRoutes,
  COMPLIANCE_BASE,
  absolutize,
  extractComplianceReportVersionId,
} from "./constants";

import {
  runPermissionRules,
  PermissionRule as BasePermissionRule,
  ContextAwareNextRequest as BaseContextAwareNextRequest,
  makeRuleRedirect,
} from "./ruleRunner";

import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import type { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";

// ---------- helpers ----------
const redirectTo = (path: string, request: NextRequest) =>
  NextResponse.redirect(new URL(absolutize(path), request.url));

const HUB_SUMMARIES_PATH = `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`;

// ---------- specialized types for this middleware ----------
type RuleContext = {
  issuanceDataCache: Record<number, RequestIssuanceComplianceSummaryData>;
  redirectTargetById: Record<
    number,
    | AppRoutes.RI_TRACK_STATUS
    | AppRoutes.RI_REVIEW_SUMMARY
    | AppRoutes.RI_REVIEW_SUMMARY_CREDITS
    | AppRoutes.RI_EARNED_CREDITS
    | AppRoutes.REVIEW_BY_DIRECTOR
    | undefined
  >;

  getIssuanceData: (
    id: number,
  ) => Promise<RequestIssuanceComplianceSummaryData>;
};

type ContextAwareNextRequest = BaseContextAwareNextRequest<RuleContext>;
type PermissionRule = BasePermissionRule<RuleContext>;

// --------------------
// Context Factory (with caching)
// --------------------
const createRuleContext = (): RuleContext => {
  const issuanceDataCache: RuleContext["issuanceDataCache"] = {};
  const redirectTargetById: RuleContext["redirectTargetById"] = {};

  return {
    issuanceDataCache,
    redirectTargetById,

    async getIssuanceData(id: number) {
      if (!issuanceDataCache[id]) {
        issuanceDataCache[id] =
          await getRequestIssuanceComplianceSummaryData(id);
      }
      return issuanceDataCache[id];
    },
  };
};

// --------------------
// Permission Rules
// --------------------
const permissionRules: PermissionRule[] = [
  /**
   * Rule: request-issuance-review-summary
   *
   * Purpose:
   *   Ensures users cannot access the review summary page after issuance
   *   is finalized (Approved or Declined).
   *
   * Redirect Rules:
   *   - If issuance_status is APPROVED or DECLINED:
   *       → Redirect to RI_TRACK_STATUS (/track-status-of-issuance)
   */
  {
    name: "accessReviewSummary",
    isApplicable: (request) =>
      new RegExp(`/${AppRoutes.RI_REVIEW_SUMMARY}/?$`).test(
        request.nextUrl.pathname,
      ),
    validate: async (id, _req, context) => {
      if (typeof id !== "number") return false;
      try {
        const data = await context!.getIssuanceData(id);
        if (
          data.issuance_status === IssuanceStatus.APPROVED ||
          data.issuance_status === IssuanceStatus.DECLINED
        ) {
          context!.redirectTargetById[id] = AppRoutes.RI_TRACK_STATUS;
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    redirect: makeRuleRedirect(HUB_SUMMARIES_PATH),
  },

  /**
   * Rule: review-by-director
   *
   * Purpose:
   *   Controls navigation for the "Review by Director" step in the earned credits issuance flow.
   *
   * Access Criteria:
   *   - Applies when accessing the review-by-director page for a compliance report version.
   *   - Uses issuance status, analyst suggestion to determine the next step.
   *
   * Redirect Rules:
   *   - If issuance_status is CREDITS_NOT_ISSUED:
   *       → Redirect to:
   *        •  RI_REVIEW_SUMMARY (/request-issuance-review-summary)
   *   - If issuance_status is:
   *        • APPROVED
   *        • DECLINED
   *      → Redirect to:
   *        • RI_TRACK_STATUS  (/track-status-of-issuance)
   *   - If there is **no `analyst_suggestion`**:
   *      → Redirect to:
   *        • RI_REVIEW_SUMMARY_CREDITS  (/review-credits-issuance-request)
   */
  {
    name: "accessReviewDirector",
    isApplicable: (request) =>
      new RegExp(`/${AppRoutes.REVIEW_BY_DIRECTOR}/?$`).test(
        request.nextUrl.pathname,
      ),
    validate: async (id, _req, context) => {
      if (typeof id !== "number") return false;
      try {
        const data = await context!.getIssuanceData(id);

        if (data.issuance_status === IssuanceStatus.CREDITS_NOT_ISSUED) {
          context!.redirectTargetById[id] = AppRoutes.RI_REVIEW_SUMMARY;
          return false;
        }

        if (
          data.issuance_status === IssuanceStatus.APPROVED ||
          data.issuance_status === IssuanceStatus.DECLINED
        ) {
          context!.redirectTargetById[id] = AppRoutes.RI_TRACK_STATUS;
          return false;
        }

        if (!data.analyst_suggestion) {
          context!.redirectTargetById[id] = AppRoutes.RI_REVIEW_SUMMARY_CREDITS;
          return false;
        }

        return true;
      } catch {
        return false;
      }
    },
    redirect: makeRuleRedirect(HUB_SUMMARIES_PATH),
  },

  /**
   * Rule: review-credits-issuance-request
   *
   * Purpose:
   *   Controls navigation for the "Review Credits Issuance Request step in the earned credits issuance flow.
   *
   * Access Criteria:
   *   - Applies when accessing the review-credits-issuance-request for a compliance report version.
   *   - Uses issuance status to determine the next step.
   *
   * Redirect Rules:
   *   - If issuance_status is CREDITS_NOT_ISSUED:
   *       → Redirect to:
   *        •  RI_REVIEW_SUMMARY (/request-issuance-review-summary)
   *   - If issuance_status is APPROVED or DECLINED:
   *       → Redirect to RI_TRACK_STATUS (/track-status-of-issuance)
   */
  {
    name: "accessReviewCredits",
    isApplicable: (request) =>
      new RegExp(`/${AppRoutes.RI_REVIEW_SUMMARY_CREDITS}/?$`).test(
        request.nextUrl.pathname,
      ),
    validate: async (id, _req, context) => {
      if (typeof id !== "number") return false;
      try {
        const data = await context!.getIssuanceData(id);

        if (data.issuance_status === IssuanceStatus.CREDITS_NOT_ISSUED) {
          context!.redirectTargetById[id] = AppRoutes.RI_REVIEW_SUMMARY;
          return false;
        }

        if (
          data.issuance_status === IssuanceStatus.APPROVED ||
          data.issuance_status === IssuanceStatus.DECLINED
        ) {
          context!.redirectTargetById[id] = AppRoutes.RI_TRACK_STATUS;
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    redirect: makeRuleRedirect(HUB_SUMMARIES_PATH),
  },

  /**
   * Rule: track-status-of-issuance
   *
   * Purpose:
   *   Controls navigation for the issuance tracking page based on status.
   *
   * Redirect Rules:
   *   - If issuance_status is CREDITS_NOT_ISSUED:
   *       → Redirect to RI_REVIEW_SUMMARY (/request-issuance-review-summary)
   *   - If issuance_status is ISSUANCE_REQUESTED or CHANGES_REQUIRED:
   *       → Redirect to REVIEW_BY_DIRECTOR (/review-by-director)
   */
  {
    name: "accessTrackStatusIssuance",
    isApplicable: (request) =>
      new RegExp(`/${AppRoutes.RI_TRACK_STATUS}/?$`).test(
        request.nextUrl.pathname,
      ),
    validate: async (id, _req, context) => {
      if (typeof id !== "number") return false;
      try {
        const data = await context!.getIssuanceData(id);

        if (data.issuance_status === IssuanceStatus.CREDITS_NOT_ISSUED) {
          context!.redirectTargetById[id] = AppRoutes.RI_REVIEW_SUMMARY;
          return false;
        }

        if (
          data.issuance_status === IssuanceStatus.ISSUANCE_REQUESTED ||
          data.issuance_status === IssuanceStatus.CHANGES_REQUIRED
        ) {
          context!.redirectTargetById[id] = AppRoutes.REVIEW_BY_DIRECTOR;
          return false;
        }

        return true;
      } catch {
        return false;
      }
    },
    redirect: makeRuleRedirect(HUB_SUMMARIES_PATH),
  },
];

// --------------------
// Rule Runner
// --------------------
const checkHasPathAccess = (request: ContextAwareNextRequest) =>
  runPermissionRules<RuleContext>(request, {
    extractId: (pathname) =>
      extractComplianceReportVersionId(pathname) ?? undefined,
    createContext: createRuleContext,
    rules: permissionRules,
    onErrorRedirect: (req) => redirectTo(HUB_SUMMARIES_PATH, req),
  });

// --------------------
// Middleware Export
// --------------------
export const withRuleHasComplianceRouteAccessIDIR: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next) => {
    const token = await getToken();
    const role = getUserRole(token);

    if (role === IDP.IDIR) {
      const response = await checkHasPathAccess(
        request as ContextAwareNextRequest,
      );
      if (response) return response;
    }

    return next(request, _next);
  };
};
