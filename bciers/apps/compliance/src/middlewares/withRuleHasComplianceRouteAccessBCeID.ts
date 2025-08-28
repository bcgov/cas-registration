import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory, getUserRole } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import {
  extractComplianceReportVersionId,
  COMPLIANCE_BASE,
  AppRoutes,
  ComplianceStatus,
  routesNoObligation,
  routesObligation,
  routesEarnedCredits,
  absolutize,
  hasSegment,
} from "./constants";
import {
  runPermissionRules,
  makeRuleRedirect,
  PermissionRule as BasePermissionRule,
  ContextAwareNextRequest as BaseContextAwareNextRequest,
} from "./ruleRunner";

import {
  IDP,
  IssuanceStatus,
  ComplianceSummaryStatus,
} from "@bciers/utils/src/enums";
import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import getUserComplianceAccessStatus from "@/compliance/src/app/utils/getUserComplianceAccessStatus";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";

// --------------------
// Helpers
// --------------------
const redirectTo = (path: string, request: NextRequest) =>
  NextResponse.redirect(new URL(absolutize(path), request.url));

const HUB_SUMMARIES_PATH = `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`;
const ONBOARDING_PATH = absolutize(AppRoutes.ONBOARDING);

// --------------------
// Types
// --------------------
interface IssuanceSummary {
  issuance_status?: IssuanceStatus;
}

// Specialize the generic types for this middleware
type RuleContext = {
  canApplyComplianceUnitsCache: Record<number, boolean>;
  issuanceSummaryCache: Record<number, IssuanceSummary>;

  // flags used by accessEarnedCredits to choose redirect target
  redirectToTrackStatusById: Record<number, boolean>;
  redirectToRequestIssuanceCreditsById: Record<number, boolean>;

  // optional generic target map (not required here, but supported by makeRuleRedirect)
  redirectTargetById?: Record<number, string | undefined>;

  getComplianceAppliedUnits: (id: number) => Promise<boolean>;
  getUserComplianceAccessStatus: (
    id?: number,
  ) => Promise<ComplianceStatus | undefined>;
  getIssuanceSummary: (id: number) => Promise<IssuanceSummary>;
};

type ContextAwareNextRequest = BaseContextAwareNextRequest<RuleContext>;
type PermissionRule = BasePermissionRule<RuleContext>;

// --------------------
// Context Factory (with caching)
// --------------------
const createRuleContext = (): RuleContext => {
  const canApplyComplianceUnitsCache: Record<number, boolean> = {};
  const issuanceSummaryCache: Record<number, IssuanceSummary> = {};
  const redirectToTrackStatusById: Record<number, boolean> = {};
  const redirectToRequestIssuanceCreditsById: Record<number, boolean> = {};
  let getComplianceAccessCache: ComplianceStatus | undefined;

  return {
    canApplyComplianceUnitsCache,
    issuanceSummaryCache,
    redirectToTrackStatusById,
    redirectToRequestIssuanceCreditsById,

    async getComplianceAppliedUnits(id) {
      if (!(id in canApplyComplianceUnitsCache)) {
        const result = await getComplianceAppliedUnits(id);
        canApplyComplianceUnitsCache[id] = result.can_apply_compliance_units;
      }
      return canApplyComplianceUnitsCache[id];
    },

    async getUserComplianceAccessStatus(id) {
      if (getComplianceAccessCache === undefined) {
        const result = await getUserComplianceAccessStatus(id);
        getComplianceAccessCache = result?.status as
          | ComplianceStatus
          | undefined;
      }
      return getComplianceAccessCache;
    },

    async getIssuanceSummary(id) {
      if (!issuanceSummaryCache[id]) {
        issuanceSummaryCache[id] =
          await getRequestIssuanceComplianceSummaryData(id);
      }
      return issuanceSummaryCache[id];
    },
  };
};

// --------------------
// Compliance status check helper
// --------------------
const checkAccess = async (
  context: RuleContext,
  id: number | undefined,
  allowed: ComplianceSummaryStatus[],
  extra?: () => Promise<boolean>,
) => {
  const accessStatus = await context.getUserComplianceAccessStatus(id);
  if (!accessStatus) return false;
  if (!allowed.includes(accessStatus as ComplianceSummaryStatus)) return false;
  if (extra) return extra();
  return true;
};

// --------------------
// Permission Rules (using makeRuleRedirect)
// --------------------
const permissionRules: PermissionRule[] = [
  /**
   * Rule: accessComplianceRoute
   *
   * Purpose:
   *   Acts as a global access gate for compliance app ensuring user has a registered operation.
   *   Also, ensures the user has permission to view a given registered operation's compliance report version.
   *
   * Access Criteria:
   *   - Applies to every request in compliance
   *   - Calls `getUserComplianceAccessStatus` with the CRV ID (if present).
   *   - Access is denied if:
   *     • Status is missing (undefined), OR
   *     • Status is "Invalid" (i.e no operation registered or user does not own the CRV).
   *
   * Redirect Rules:
   *   - If access is denied → Redirect to ONBOARDING page.
   */
  {
    name: "accessComplianceRoute",
    isApplicable: () => true,
    validate: async (complianceReportVersionId, _request, context) => {
      const accessStatus = await context!.getUserComplianceAccessStatus(
        complianceReportVersionId,
      );
      return accessStatus !== undefined && accessStatus !== "Invalid";
    },
    redirect: makeRuleRedirect<RuleContext>(ONBOARDING_PATH),
  },
  /**
   * Rule: accessNoObligation
   *
   * Purpose:
   *   Controls access to "No Obligation" routes.
   *
   * Access Criteria:
   *   - Applies to any route path in (no-obligation)
   *   - User must have a compliance report with status: NO_OBLIGATION_OR_EARNED_CREDITS.
   *
   * Redirect Rules:
   *   - If access is denied → Redirect to REVIEW_COMPLIANCE_SUMMARIES.
   */
  {
    name: "accessNoObligation",
    isApplicable: (request) =>
      routesNoObligation.some(
        (path) => request.nextUrl.pathname.split("/").pop() === path,
      ),
    validate: (id, _req, context) =>
      checkAccess(context!, id, [
        ComplianceSummaryStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
      ]),
    redirect: makeRuleRedirect(HUB_SUMMARIES_PATH),
  },
  /**
   * Rule: accessObligation
   *
   * Purpose:
   *   Controls access to "Manage Obligation" routes.
   *
   * Access Criteria:
   *   - Applies to any route path in (manage-obligation)
   *   - User must have a compliance report with status: OBLIGATION_NOT_MET.
   *   - If the route is MO_APPLY_COMPLIANCE_UNITS (/apply-compliance-units):
   *       • The user must also pass `getComplianceAppliedUnits(id)`.
   *
   * Redirect Rules:
   *
   *  1. From Apply Units to Request Issuance
   *      If the user is on:
   *        • MO_APPLY_COMPLIANCE_UNITS (/apply-compliance-units)
   *      AND getComplianceAppliedUnits(id).can_apply_compliance_units is:
   *        • False
   *      → Redirect to:
   *        • Redirect to REVIEW_COMPLIANCE_SUMMARIES
   *
   * Default Redirect:
   *   - If access is denied → Redirect to REVIEW_COMPLIANCE_SUMMARIES.
   */
  {
    name: "accessObligation",
    isApplicable: (request) =>
      Boolean(
        routesObligation.some((path) =>
          request.nextUrl.pathname.includes(path),
        ),
      ),
    validate: async (id, request, context) => {
      const statusOk = await checkAccess(context!, id, [
        ComplianceSummaryStatus.OBLIGATION_NOT_MET,
        ComplianceSummaryStatus.OBLIGATION_FULLY_MET,
      ]);
      if (!statusOk) return false;

      if (
        request?.nextUrl.pathname.includes(AppRoutes.MO_APPLY_COMPLIANCE_UNITS)
      ) {
        return typeof id === "number" && context!.getComplianceAppliedUnits(id);
      }
      return true;
    },
    redirect: makeRuleRedirect(HUB_SUMMARIES_PATH),
  },
  /**
   * Rule: accessEarnedCredits
   *
   * Purpose:
   *   Controls access and redirection for "Earned Credits" issuance routes.
   *
   * Access Criteria:
   *   - Applies to any route path in (request-issuance)
   *   - User must have a compliance report with status: EARNED_CREDITS.
   *
   * Redirect Rules:
   *   1. From Review to Track Status
   *      If the user is on either:
   *        • RI_EARNED_CREDITS   (/request-issuance-of-earned-credits)
   *        • RI_REVIEW_SUMMARY   (/request-issuance-review-summary)
   *      AND the issuance_status is one of:
   *        • ISSUANCE_REQUESTED
   *        • APPROVED
   *        • DECLINED
   *      → Redirect to:
   *        • RI_TRACK_STATUS     (/track-status-of-issuance)
   *
   *   2. From Track Status to Request Issuance
   *      If the user is on:
   *        • RI_TRACK_STATUS     (/track-status-of-issuance)
   *      AND the issuance_status is one of:
   *        • CREDITS_NOT_ISSUED
   *        • CHANGES_REQUIRED
   *      → Redirect to:
   *        • RI_EARNED_CREDITS   (/request-issuance-of-earned-credits)
   *
   * Default Redirect:
   *   - If no special redirect applies, go to:
   *     • REVIEW_COMPLIANCE_SUMMARIES
   */
  {
    name: "accessEarnedCredits",
    isApplicable: (request) =>
      Boolean(
        routesEarnedCredits.some((path) =>
          request.nextUrl.pathname.includes(path),
        ),
      ),
    validate: async (id, request, context) => {
      const statusOk = await checkAccess(context!, id, [
        ComplianceSummaryStatus.EARNED_CREDITS,
      ]);
      if (!statusOk || typeof id !== "number") return false;

      const pathname = request!.nextUrl.pathname;
      const summary = await context!.getIssuanceSummary(id);

      const shouldTrack = [
        IssuanceStatus.ISSUANCE_REQUESTED,
        IssuanceStatus.APPROVED,
        IssuanceStatus.DECLINED,
      ].includes(summary.issuance_status as IssuanceStatus);

      const shouldRequestIssuance = [
        IssuanceStatus.CREDITS_NOT_ISSUED,
        IssuanceStatus.CHANGES_REQUIRED,
      ].includes(summary.issuance_status as IssuanceStatus);

      const isReviewIssuance =
        hasSegment(pathname, AppRoutes.RI_REVIEW_SUMMARY) ||
        hasSegment(pathname, AppRoutes.RI_EARNED_CREDITS);

      const isTrackStatus = hasSegment(pathname, AppRoutes.RI_TRACK_STATUS);

      if (isReviewIssuance && shouldTrack) {
        context!.redirectToTrackStatusById[id] = true;
        return false;
      }
      if (isTrackStatus && shouldRequestIssuance) {
        context!.redirectToRequestIssuanceCreditsById[id] = true;
        return false;
      }
      return true;
    },
    redirect: makeRuleRedirect<RuleContext>(HUB_SUMMARIES_PATH, (id, ctx) => {
      if (ctx.redirectToTrackStatusById[id]) {
        return AppRoutes.RI_TRACK_STATUS;
      }
      if (ctx.redirectToRequestIssuanceCreditsById[id]) {
        return AppRoutes.RI_EARNED_CREDITS;
      }
      return undefined; // → fall back to hub
    }),
  },
  /**
   * Rule: redirectPendingInvoice
   *
   * Purpose:
   *   Redirects users whose compliance report version status is
   *   "OBLIGATION_PENDING_INVOICE_CREATION" to the summaries hub.
   *
   * Access Criteria:
   *   - Applies only when the compliance report version matches:
   *     ComplianceSummaryStatus.OBLIGATION_PENDING_INVOICE_CREATION
   *
   * Redirect Rules:
   *   - If the status matches → Redirect to HUB_SUMMARIES_PATH.
   *   - If the status does not match → Continue to the requested route.
   */
  {
    name: "redirectPendingInvoice",
    isApplicable: async (_request, id, context) => {
      return checkAccess(context!, id, [
        ComplianceSummaryStatus.OBLIGATION_PENDING_INVOICE_CREATION,
      ]);
    },
    validate: async () => false,
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
    onErrorRedirect: (req) => redirectTo(AppRoutes.ONBOARDING, req),
  });

// --------------------
// Middleware Export
// --------------------
export const withRuleHasComplianceRouteAccessBCeID: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next) => {
    const token = await getToken();
    const role = getUserRole(token);

    if (role === IDP.BCEIDBUSINESS) {
      const response = await checkHasPathAccess(
        request as ContextAwareNextRequest,
      );
      if (response) return response;
    }
    return next(request, _next);
  };
};
