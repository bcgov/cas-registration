import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import {
  extractComplianceReportVersionId,
  AppRoutes,
  COMPLIANCE_BASE,
  COMPLIANCE_REPORT_BASE,
} from "./constants";
import { getUserRole } from "@bciers/middlewares";
import { IDP } from "@bciers/utils/src/enums";

import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";

export type RuleContext = {
  canApplyComplianceUnitsCache: Record<number, boolean>;
  getComplianceAppliedUnits: (
    complianceReportVersionId: number,
  ) => Promise<boolean>;
};

export type PermissionRule = {
  name: string;
  isApplicable: (
    request: NextRequest,
    complianceReportVersionId: number,
    context?: RuleContext,
  ) => boolean | Promise<boolean>;
  validate: (
    complianceReportVersionId: number,
    request?: NextRequest,
    context?: RuleContext,
  ) => boolean | Promise<boolean>;
  redirect: (
    complianceReportVersionId: number,
    request: NextRequest,
  ) => NextResponse;
};

const createRuleContext = (): RuleContext => {
  const canApplyComplianceUnitsCache: Record<number, boolean> = {};

  return {
    canApplyComplianceUnitsCache,
    getComplianceAppliedUnits: async (complianceReportVersionId: number) => {
      if (!(complianceReportVersionId in canApplyComplianceUnitsCache)) {
        const result = await getComplianceAppliedUnits(
          complianceReportVersionId,
        );
        canApplyComplianceUnitsCache[complianceReportVersionId] =
          result.can_apply_units;
      }
      return canApplyComplianceUnitsCache[complianceReportVersionId];
    },
  };
};

export const permissionRules: PermissionRule[] = [
  {
    name: "accessCanApplyUnits",
    isApplicable: (request) =>
      request.nextUrl.pathname.includes(AppRoutes.APPLY_COMPLIANCE_UNITS),
    validate: async (complianceReportVersionId, _request, context) => {
      return await context!.getComplianceAppliedUnits(
        complianceReportVersionId,
      );
    },
    redirect: (complianceReportVersionId, request) =>
      NextResponse.redirect(
        new URL(
          `${COMPLIANCE_BASE}${COMPLIANCE_REPORT_BASE}${complianceReportVersionId}${AppRoutes.REVIEW_COMPLIANCE_SUMMARY}`,
          request.url,
        ),
      ),
  },
];

const checkHasPathAccess = async (request: NextRequest) => {
  try {
    const { pathname } = request.nextUrl;
    const complianceReportVersionId =
      extractComplianceReportVersionId(pathname);
    if (!complianceReportVersionId) return null;
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
