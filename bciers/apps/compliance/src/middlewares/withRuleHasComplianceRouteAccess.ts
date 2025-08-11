import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import {
  extractComplianceReportVersionId,
  COMPLIANCE_BASE,
  AppRoutes,
  ComplianceReportVersionStatus,
  ComplianceStatus,
  routesNoObligation,
  routesObligation,
  routesEarnedCredits,
  absolutize,
  hasSegment,
} from "./constants";
import { getUserRole } from "@bciers/middlewares";
import { IDP, IssuanceStatus } from "@bciers/utils/src/enums";

import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import getUserComplianceAccessStatus from "@/compliance/src/app/utils/getUserComplianceAccessStatus";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";

// --------------------
// Helpers
// --------------------
const redirectTo = (path: string, request: NextRequest) =>
  NextResponse.redirect(new URL(absolutize(path), request.url));

// Sub-app guards to avoid rule collisions
const isInReviewSummaries = (pathname: string) =>
  pathname.includes(
    `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}/`,
  );
const isInComplianceSummaries = (pathname: string) =>
  pathname.includes(`/${COMPLIANCE_BASE}/compliance-summaries/`);

// --------------------
// Types
// --------------------
interface IssuanceSummary {
  issuance_status?: IssuanceStatus;
}

interface ContextAwareNextRequest extends NextRequest {
  __ctx?: RuleContext;
}

type RuleContext = {
  canApplyComplianceUnitsCache: Record<number, boolean>;
  issuanceSummaryCache: Record<number, IssuanceSummary>;
  redirectToTrackStatusById: Record<number, boolean>;
  redirectToRequestIssuanceCreditsById: Record<number, boolean>;
  getComplianceAppliedUnits: (id: number) => Promise<boolean>;
  getUserComplianceAccessStatus: (
    id?: number,
  ) => Promise<ComplianceStatus | undefined>;
  getIssuanceSummary: (id: number) => Promise<IssuanceSummary>;
};

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
// Permission Rule Type
// --------------------
type PermissionRule = {
  name: string;
  isApplicable: (
    request: NextRequest,
    id?: number,
    context?: RuleContext,
  ) => boolean | Promise<boolean>;
  validate: (
    id?: number,
    request?: NextRequest,
    context?: RuleContext,
  ) => boolean | Promise<boolean>;
  redirect: (
    id: number | undefined,
    request: ContextAwareNextRequest,
  ) => NextResponse;
};

// --------------------
// Status check helper
// --------------------
const checkAccess = async (
  context: RuleContext,
  id: number | undefined,
  allowed: ComplianceReportVersionStatus[],
  extra?: () => Promise<boolean>,
) => {
  const accessStatus = await context.getUserComplianceAccessStatus(id);
  if (
    !accessStatus ||
    !allowed.includes(accessStatus as ComplianceReportVersionStatus)
  ) {
    return false;
  }
  return extra ? extra() : true;
};

// --------------------
// Permission Rules
// --------------------
const permissionRules: PermissionRule[] = [
  // Global access gate
  {
    name: "accessComplianceRoute",
    isApplicable: () => true,
    validate: async (complianceReportVersionId, _request, context) => {
      const accessStatus = await context!.getUserComplianceAccessStatus(
        complianceReportVersionId,
      );
      return accessStatus !== undefined && accessStatus !== "Invalid";
    },
    redirect: (_id, request) =>
      NextResponse.redirect(
        new URL(absolutize(AppRoutes.ONBOARDING), request.url),
      ),
  },

  // No Obligation routes
  {
    name: "accessNoObligation",
    isApplicable: (request) =>
      isInReviewSummaries(request.nextUrl.pathname) &&
      routesNoObligation.some((seg) =>
        hasSegment(request.nextUrl.pathname, seg),
      ),
    validate: (id, _req, context) =>
      checkAccess(context!, id, [
        ComplianceReportVersionStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
      ]),
    redirect: (_id, request) =>
      redirectTo(
        `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`,
        request,
      ),
  },

  // Obligation routes
  {
    name: "accessObligation",
    isApplicable: (request) =>
      isInReviewSummaries(request.nextUrl.pathname) &&
      routesObligation.some((seg) => hasSegment(request.nextUrl.pathname, seg)),
    validate: async (id, request, context) => {
      const statusOk = await checkAccess(context!, id, [
        ComplianceReportVersionStatus.OBLIGATION_NOT_MET,
      ]);
      if (!statusOk) return false;

      if (
        request?.nextUrl.pathname.includes(AppRoutes.MO_APPLY_COMPLIANCE_UNITS)
      ) {
        return typeof id === "number" && context!.getComplianceAppliedUnits(id);
      }
      return true;
    },
    redirect: (_id, request) =>
      redirectTo(
        `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`,
        request,
      ),
  },

  // Earned Credits routes
  {
    name: "accessEarnedCredits",
    isApplicable: (request) =>
      isInComplianceSummaries(request.nextUrl.pathname) &&
      routesEarnedCredits.some((seg) =>
        hasSegment(request.nextUrl.pathname, seg),
      ),
    validate: async (id, request, context) => {
      const isEarned = await checkAccess(context!, id, [
        ComplianceReportVersionStatus.EARNED_CREDITS,
      ]);
      if (!isEarned || typeof id !== "number") return isEarned;

      const pathname = request!.nextUrl.pathname;
      const summary = await context!.getIssuanceSummary(id);
      //  - If user is on:
      //   • RI_REVIEW_SUMMARY (request-issuance-review-summary), or
      //   • RI_EARNED_CREDITS (request-issuance-of-earned-credits)
      //      AND issuance_status is one of:
      //      • ISSUANCE_REQUESTED
      //      • APPROVED
      //      • DECLINED
      //     THEN redirect to:
      //      • RI_TRACK_STATUS (track-status-of-issuance)
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
    redirect: (id, request) => {
      const ctx = (request as any).__ctx as RuleContext | undefined;
      if (typeof id === "number") {
        if (ctx?.redirectToTrackStatusById[id]) {
          return redirectTo(
            `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}/${id}/${AppRoutes.RI_TRACK_STATUS}`,
            request,
          );
        }
        if (ctx?.redirectToRequestIssuanceCreditsById[id]) {
          return redirectTo(
            `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}/${id}/${AppRoutes.RI_EARNED_CREDITS}`,
            request,
          );
        }
      }
      return redirectTo(
        `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`,
        request,
      );
    },
  },
];

// --------------------
// Rule Runner
// --------------------
const checkHasPathAccess = async (request: ContextAwareNextRequest) => {
  try {
    const { pathname } = request.nextUrl;
    const complianceReportVersionId =
      extractComplianceReportVersionId(pathname) ?? undefined;

    const context = createRuleContext();
    request.__ctx = context;

    for (const rule of permissionRules) {
      if (
        await rule.isApplicable(request, complianceReportVersionId, context)
      ) {
        const isValid = await rule.validate(
          complianceReportVersionId,
          request,
          context,
        );
        if (!isValid) {
          return rule.redirect(complianceReportVersionId, request);
        }
      }
    }
  } catch (err) {
    console.error("Compliance middleware error:", err);
    return redirectTo(AppRoutes.ONBOARDING, request);
  }
  return null;
};

// --------------------
// Middleware Export
// --------------------
export const withRuleHasComplianceRouteAccess: MiddlewareFactory = (
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
