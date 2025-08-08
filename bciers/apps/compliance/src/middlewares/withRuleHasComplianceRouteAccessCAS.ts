import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import {
  extractComplianceReportVersionId,
  COMPLIANCE_BASE,
  AppRoutes,
} from "./constants";
import { getUserRole } from "@bciers/middlewares";
import { IDP, IssuanceStatus } from "@bciers/utils/src/enums";

import { getRequestIssuanceComplianceSummaryData } from "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData";
import { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";

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
    // Enforce director review flow:
    // - if analyst hasn't reviewed -> send to review-credits-issuance-request
    // - if approved/declined -> send to track-status-of-issuance
    name: "directorIssuanceGuards",
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

        // Not ready for director yet (no analyst suggestion)
        if (!data?.analyst_suggestion) return false;

        // Already finalized (approved/declined) -> not valid here
        if (
          [IssuanceStatus.APPROVED, IssuanceStatus.DECLINED].includes(
            data.issuance_status as IssuanceStatus,
          )
        ) {
          return false;
        }

        // Otherwise valid to proceed to director page
        return true;
      } catch {
        // On any error, treat as invalid -> fallback redirect
        return false;
      }
    },
    redirect: (complianceReportVersionId, request, context) => {
      // Default fallback
      const fallback = new URL(
        `/${COMPLIANCE_BASE}/${AppRoutes.REVIEW_COMPLIANCE_SUMMARIES}`,
        request.url,
      );

      if (typeof complianceReportVersionId !== "number") {
        return NextResponse.redirect(fallback);
      }

      // Base path for this version (strip the trailing segment)
      const basePath = request.nextUrl.pathname.replace(
        new RegExp(`/${AppRoutes.REVIEW_BY_DIRECTOR}/?$`),
        "",
      );

      try {
        const data = context.issuanceSummaryCache[complianceReportVersionId];

        // If cache is empty for some reason, fallback
        if (!data) return NextResponse.redirect(fallback);

        // 1) No analyst suggestion -> go to review credits issuance request
        if (!data.analyst_suggestion) {
          const target = new URL(
            `${basePath}/${AppRoutes.REVIEW_CREDITS_ISSUANCE_REQUEST}`,
            request.url,
          );
          return NextResponse.redirect(target);
        }

        // 2) Approved/declined -> go to track status page
        if (
          [IssuanceStatus.APPROVED, IssuanceStatus.DECLINED].includes(
            data.issuance_status as IssuanceStatus,
          )
        ) {
          const target = new URL(
            `${basePath}/${AppRoutes.TRACK_STATUS_OF_ISSUANCE}`,
            request.url,
          );
          return NextResponse.redirect(target);
        }

        // 3) Otherwise fallback (defensive)
        return NextResponse.redirect(fallback);
      } catch {
        return NextResponse.redirect(fallback);
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

    if (role === IDP.IDIR) {
      const response = await checkHasPathAccess(request);
      if (response) return response;
    }

    return next(request, _next);
  };
};
