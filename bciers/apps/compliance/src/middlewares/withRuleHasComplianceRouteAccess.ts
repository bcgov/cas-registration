import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import {
  extractComplianceReportVersionId,
  COMPLIANCE_BASE,
  AppRoutes,
  ComplianceReportVersionStatus,
  NoObligationRoutes,
  routesNoObligation,
  routesObligation,
  routesEarnedCredits,
} from "./constants";
import { getUserRole } from "@bciers/middlewares";
import { IDP } from "@bciers/utils/src/enums";

import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import getUserComplianceAccessStatus from "@/compliance/src/app/utils/getUserComplianceAccessStatus";

// --------------------
// Rule Context & Types
// --------------------
type RuleContext = {
  canApplyComplianceUnitsCache: Record<number, boolean>;
  getComplianceAppliedUnits: (
    complianceReportVersionId: number,
  ) => Promise<boolean>;
  getUserComplianceAccessStatus: (
    complianceReportVersionId?: number,
  ) => Promise<string | undefined>;
};

const createRuleContext = (): RuleContext => {
  const canApplyComplianceUnitsCache: Record<number, boolean> = {};
  let getComplianceAccessCache: string | undefined;

  return {
    canApplyComplianceUnitsCache,
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

      // 2) If the route is APPLY_COMPLIANCE_UNITS, also require "can apply units"
      const isApplyUnits = request?.nextUrl.pathname.includes(
        AppRoutes.APPLY_COMPLIANCE_UNITS,
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
    validate: async (complianceReportVersionId, _request, context) => {
      const accessStatus = await context!.getUserComplianceAccessStatus(
        complianceReportVersionId,
      );
      return accessStatus === ComplianceReportVersionStatus.EARNED_CREDITS;
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
