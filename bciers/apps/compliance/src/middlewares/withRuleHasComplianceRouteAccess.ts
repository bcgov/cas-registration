import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import {
  extractComplianceReportVersionId,
  COMPLIANCE_BASE,
  AppRoutes,
  ComplianceReportVersionStatus,
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
    name: "accessCanApplyUnits",
    isApplicable: (request) => {
      const match = request.nextUrl.pathname.includes(
        AppRoutes.APPLY_COMPLIANCE_UNITS,
      );
      return match;
    },

    validate: async (complianceReportVersionId, _request, context) => {
      if (typeof complianceReportVersionId !== "number") {
        return false;
      }
      return context!.getComplianceAppliedUnits(complianceReportVersionId);
    },
    redirect: (_, request) => {
      const targetPath = `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`;

      const redirectUrl = new URL(targetPath, request.url);
      return NextResponse.redirect(redirectUrl);
    },
  },
  {
    name: "accessNoObligation",
    isApplicable: (request) => {
      return /\/review-summary\/?$/.test(request.nextUrl.pathname);
    },
    validate: async (complianceReportVersionId, _request, context) => {
      const accessStatus = await context!.getUserComplianceAccessStatus(
        complianceReportVersionId,
      );
      return (
        accessStatus ===
        ComplianceReportVersionStatus.NO_OBLIGATION_OR_EARNED_CREDITS
      );
    },
    redirect: (_, request) => {
      const targetPath = `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`;

      const redirectUrl = new URL(targetPath, request.url);
      return NextResponse.redirect(redirectUrl);
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
    const token = await getToken();
    const role = getUserRole(token);

    if (role === IDP.BCEIDBUSINESS) {
      const response = await checkHasPathAccess(request);
      if (response) return response;
    }

    return next(request, _next);
  };
};
