import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import {
  extractComplianceReportVersionId,
  COMPLIANCE_BASE,
  AppRoutes,
  absolutize,
  stripTrailingSegment,
} from "./constants";
import { getUserRole } from "@bciers/middlewares";
import { IDP, IssuanceStatus } from "@bciers/utils/src/enums";

import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";

// --------------------
// Helpers
// --------------------
const redirectTo = (path: string, request: NextRequest) =>
  NextResponse.redirect(new URL(absolutize(path), request.url));

// --------------------
// Rule Context & Types
// --------------------
type RuleContext = {
  issuanceSummaryCache: Record<number, RequestIssuanceComplianceSummaryData>;
  getRequestIssuanceComplianceSummaryData: (
    complianceReportVersionId?: number,
  ) => Promise<RequestIssuanceComplianceSummaryData>;
};

const createRuleContext = (): RuleContext => {
  const issuanceSummaryCache: Record<
    number,
    RequestIssuanceComplianceSummaryData
  > = {};

  return {
    issuanceSummaryCache,
    async getRequestIssuanceComplianceSummaryData(
      complianceReportVersionId?: number,
    ) {
      if (typeof complianceReportVersionId !== "number") {
        throw new Error(
          "complianceReportVersionId is required for issuance summary",
        );
      }
      if (!(complianceReportVersionId in issuanceSummaryCache)) {
        const data = await getRequestIssuanceComplianceSummaryData(
          complianceReportVersionId,
        );
        issuanceSummaryCache[complianceReportVersionId] = data;
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
    context: RuleContext,
  ) => NextResponse;
};

const permissionRules: PermissionRule[] = [
  {
    // review-by-director
    // Redirects to://
    // request-issuance-of-earned-credits when no analyst suggestion.
    // track-status-of-issuance when status is APPROVED or DECLINED.
    name: "accessReviewDirector",
    isApplicable: (request) => {
      const pattern = new RegExp(`/${AppRoutes.REVIEW_BY_DIRECTOR}/?$`);
      return pattern.test(request.nextUrl.pathname);
    },
    validate: async (complianceReportVersionId, _request, context) => {
      try {
        if (typeof complianceReportVersionId !== "number") return false;

        const data = await context!.getRequestIssuanceComplianceSummaryData(
          complianceReportVersionId,
        );

        // Not ready for director yet (no analyst suggestion) -> redirect
        if (!data?.analyst_suggestion) return false;

        // Already finalized (approved/declined) -> redirect
        if (
          [IssuanceStatus.APPROVED, IssuanceStatus.DECLINED].includes(
            data.issuance_status as IssuanceStatus,
          )
        ) {
          return false;
        }

        // Otherwise the director review page is valid
        return true;
      } catch {
        // On any error, treat as invalid -> fallback redirect
        return false;
      }
    },
    redirect: (complianceReportVersionId, request, context) => {
      // Fallback to the Review Compliance Summaries hub
      const fallback = redirectTo(
        `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`,
        request,
      );

      if (typeof complianceReportVersionId !== "number") {
        return fallback;
      }

      // Build the base path for this CRV by removing the trailing director segment
      const basePath = stripTrailingSegment(
        request.nextUrl.pathname,
        AppRoutes.REVIEW_BY_DIRECTOR,
      );

      try {
        const data = context.issuanceSummaryCache[complianceReportVersionId];
        if (!data) return fallback;

        // 1) No analyst suggestion -> send to request issuance page
        if (!data.analyst_suggestion) {
          return redirectTo(
            `${basePath}/${AppRoutes.RI_EARNED_CREDITS}`,
            request,
          );
        }

        // 2) Finalized -> send to track status
        if (
          [IssuanceStatus.APPROVED, IssuanceStatus.DECLINED].includes(
            data.issuance_status as IssuanceStatus,
          )
        ) {
          return redirectTo(
            `${basePath}/${AppRoutes.RI_TRACK_STATUS}`,
            request,
          );
        }

        // 3) Defensive: anything else -> fallback
        return fallback;
      } catch {
        return fallback;
      }
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
          return rule.redirect(complianceReportVersionId, request, context);
        }
      }
    }
  } catch {
    return redirectTo(AppRoutes.ONBOARDING, request);
  }
  return null;
};

// --------------------
// Middleware Export
// --------------------
export const withRuleHasComplianceRouteAccessCAS: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next) => {
    const token = await getToken();
    const role = getUserRole(token);

    // Director review is an IDIR-only flow per your spec
    if (role === IDP.IDIR) {
      const response = await checkHasPathAccess(request);
      if (response) return response;
    }

    return next(request, _next);
  };
};
