import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import {
  extractComplianceReportVersionId,
  COMPLIANCE_BASE,
  AppRoutes,
  ComplianceReportVersionStatus,
  routesNoObligation,
  routesObligation,
  routesEarnedCredits,
} from "./constants";
import { getUserRole } from "@bciers/middlewares";
import { IDP } from "@bciers/utils/src/enums";

import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import getUserComplianceAccessStatus from "@/compliance/src/app/utils/getUserComplianceAccessStatus";
import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { IssuanceStatus } from "@bciers/utils/src/enums";
// --------------------
// Rule Types & Contexts
// --------------------
type RuleContext = {
  canApplyComplianceUnitsCache: Record<number, boolean>;
  getComplianceAppliedUnits: (
    complianceReportVersionId: number,
  ) => Promise<boolean>;
  getUserComplianceAccessStatus: (
    complianceReportVersionId?: number,
  ) => Promise<string | undefined>;
  issuanceSummaryCache: Record<number, any>;
  getIssuanceSummary: (complianceReportVersionId: number) => Promise<any>;
  redirectToTrackStatusById: Record<number, boolean>;
};

const createRuleContext = (): RuleContext => {
  const canApplyComplianceUnitsCache: Record<number, boolean> = {};
  const issuanceSummaryCache: Record<number, any> = {};
  const redirectToTrackStatusById: Record<number, boolean> = {};
  let getComplianceAccessCache: string | undefined;

  return {
    canApplyComplianceUnitsCache,
    issuanceSummaryCache,
    redirectToTrackStatusById,

    getComplianceAppliedUnits: async (complianceReportVersionId: number) => {
      if (!(complianceReportVersionId in canApplyComplianceUnitsCache)) {
        const result = await getComplianceAppliedUnits(
          complianceReportVersionId,
        );
        canApplyComplianceUnitsCache[complianceReportVersionId] =
          result.can_apply_compliance_units;
      }
      return canApplyComplianceUnitsCache[complianceReportVersionId];
    },

    getUserComplianceAccessStatus: async (
      complianceReportVersionId?: number,
    ) => {
      if (getComplianceAccessCache === undefined) {
        const result = await getUserComplianceAccessStatus(
          complianceReportVersionId,
        );
        getComplianceAccessCache = result?.status;
      }
      return getComplianceAccessCache;
    },

    getIssuanceSummary: async (complianceReportVersionId: number) => {
      if (!issuanceSummaryCache[complianceReportVersionId]) {
        issuanceSummaryCache[complianceReportVersionId] =
          await getRequestIssuanceComplianceSummaryData(
            complianceReportVersionId,
          );
      }
      return issuanceSummaryCache[complianceReportVersionId];
    },
  };
};

// --------------------
// Permission Rules
// --------------------
type PermissionRule = {
  name: string;
  isApplicable: (
    request: NextRequest,
    complianceReportVersionId?: number,
    context?: RuleContext,
  ) => boolean | Promise<boolean>;
  validate: (
    complianceReportVersionId?: number,
    request?: NextRequest,
    context?: RuleContext,
  ) => boolean | Promise<boolean>;
  redirect: (
    complianceReportVersionId: number | undefined,
    request: NextRequest,
  ) => NextResponse;
};

const permissionRules: PermissionRule[] = [
  {
    name: "accessComplianceRoute",
    isApplicable: () => true,
    validate: async (complianceReportVersionId, _request, context) => {
      const accessStatus = await context!.getUserComplianceAccessStatus(
        complianceReportVersionId,
      );
      // Ensure status is defined and not "Invalid"
      return accessStatus !== undefined && accessStatus !== "Invalid";
    },
    redirect: (_id, request) =>
      NextResponse.redirect(new URL(`/${AppRoutes.ONBOARDING}`, request.url)),
  },
  {
    name: "accessNoObligation",
    isApplicable: (request) =>
      Boolean(
        routesNoObligation.some((path) =>
          request.nextUrl.pathname.includes(path),
        ),
      ),
    validate: async (complianceReportVersionId, _request, context) => {
      const accessStatus = await context!.getUserComplianceAccessStatus(
        complianceReportVersionId,
      );
      return (
        accessStatus ===
        ComplianceReportVersionStatus.NO_OBLIGATION_OR_EARNED_CREDITS
      );
    },
    redirect: (_id, request) =>
      NextResponse.redirect(
        new URL(
          `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`,
          request.url,
        ),
      ),
  },
  {
    name: "accessObligation",
    isApplicable: (request) =>
      Boolean(
        routesObligation.some((path) =>
          request.nextUrl.pathname.includes(path),
        ),
      ),
    validate: async (complianceReportVersionId, request, context) => {
      // 1) Must be "Obligation not met"
      const accessStatus = await context!.getUserComplianceAccessStatus(
        complianceReportVersionId,
      );
      const statusOk =
        accessStatus === ComplianceReportVersionStatus.OBLIGATION_NOT_MET;
      if (!statusOk) return false;

      // 2) If the route is MO_APPLY_COMPLIANCE_UNITS, also require "can apply units"
      const isApplyUnits = request?.nextUrl.pathname.includes(
        AppRoutes.MO_APPLY_COMPLIANCE_UNITS,
      );
      if (isApplyUnits) {
        if (typeof complianceReportVersionId !== "number") {
          return false;
        }
        return context!.getComplianceAppliedUnits(complianceReportVersionId);
      }

      return accessStatus === ComplianceReportVersionStatus.OBLIGATION_NOT_MET;
    },
    redirect: (_id, request) =>
      NextResponse.redirect(
        new URL(
          `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`,
          request.url,
        ),
      ),
  },
  {
    name: "accessEarnedCredits",
    isApplicable: (request) =>
      Boolean(
        routesEarnedCredits.some((path) =>
          request.nextUrl.pathname.includes(path),
        ),
      ),

    validate: async (complianceReportVersionId, request, context) => {
      const accessStatus = await context!.getUserComplianceAccessStatus(
        complianceReportVersionId,
      );
      const isEarned =
        accessStatus === ComplianceReportVersionStatus.EARNED_CREDITS;
      if (!isEarned) return false;

      // Special cases under (request-issuance)
      const isReviewComplianceSummary =
        request!.nextUrl.pathname.includes(
          AppRoutes.RI_REVIEW_SUMMARY_ISSUANCE,
        ) ||
        request!.nextUrl.pathname.includes(
          AppRoutes.RI_REVIEW_CREDITS_ISSUANCE,
        );

      if (
        isReviewComplianceSummary &&
        typeof complianceReportVersionId === "number"
      ) {
        const summary = await context!.getIssuanceSummary(
          complianceReportVersionId,
        );
        const shouldTrack = [
          IssuanceStatus.ISSUANCE_REQUESTED,
          IssuanceStatus.APPROVED,
          IssuanceStatus.DECLINED,
        ].includes(summary?.issuance_status as IssuanceStatus);

        if (shouldTrack) {
          // mark intent to redirect to track-status
          context!.redirectToTrackStatusById[complianceReportVersionId] = true;
          return false; // trigger redirect
        }
      }

      return true;
    },

    redirect: (complianceReportVersionId, request) => {
      const ctx = (request as any).__ctx as RuleContext | undefined;
      const shouldTrack =
        typeof complianceReportVersionId === "number" &&
        Boolean(ctx?.redirectToTrackStatusById[complianceReportVersionId]);

      if (shouldTrack && typeof complianceReportVersionId === "number") {
        return NextResponse.redirect(
          new URL(
            `/${COMPLIANCE_BASE}/${complianceReportVersionId}/${AppRoutes.RI_TRACK_STATUS_ISSUANCE}`,
            request.url,
          ),
        );
      }

      return NextResponse.redirect(
        new URL(
          `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`,
          request.url,
        ),
      );
    },
  },
];

// --------------------
// Rule Runner
// --------------------
const checkHasPathAccess = async (request: NextRequest) => {
  try {
    const { pathname } = request.nextUrl;
    const complianceReportVersionId =
      extractComplianceReportVersionId(pathname) ?? undefined;
    const context = createRuleContext();

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
  } catch {
    return NextResponse.redirect(new URL(AppRoutes.ONBOARDING, request.url));
  }
  return null;
};

export const withRuleHasComplianceRouteAccess: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next) => {
    // Debug: log the incoming request path
    console.log(
      "[withRuleHasComplianceRouteAccess] Path:",
      request.nextUrl.pathname,
    );

    const token = await getToken();
    const role = getUserRole(token);

    if (role === IDP.BCEIDBUSINESS) {
      const response = await checkHasPathAccess(request);
      if (response) return response;
    }

    return next(request, _next);
  };
};
