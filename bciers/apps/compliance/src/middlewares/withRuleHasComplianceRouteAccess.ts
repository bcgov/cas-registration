import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import {
  extractComplianceReportVersionId,
  COMPLIANCE_BASE,
  AppRoutes,
} from "./constants";
import { getUserRole } from "@bciers/middlewares";
import { IDP } from "@bciers/utils/src/enums";

import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import hasRegisteredRegulatedOperationForCurrentUser from "@bciers/actions/api/hasRegisteredRegulatedOperationForCurrentUser";

// --------------------
// Rule Context & Types
// --------------------
type RuleContext = {
  canApplyComplianceUnitsCache: Record<number, boolean>;
  getComplianceAppliedUnits: (
    complianceReportVersionId: number,
  ) => Promise<boolean>;
  getHasRegisteredOperation: () => Promise<boolean>;
};

const createRuleContext = (): RuleContext => {
  const canApplyComplianceUnitsCache: Record<number, boolean> = {};
  let hasRegisteredOperationCache: boolean | undefined;

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
    getHasRegisteredOperation: async () => {
      if (hasRegisteredOperationCache === undefined) {
        const result = await hasRegisteredRegulatedOperationForCurrentUser();
        hasRegisteredOperationCache =
          result.has_registered_regulated_operation === true;
      }
      return hasRegisteredOperationCache;
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
    name: "hasRegisteredOperation",
    isApplicable: () => true,
    validate: async (_id, _request, context) => {
      return context!.getHasRegisteredOperation();
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
