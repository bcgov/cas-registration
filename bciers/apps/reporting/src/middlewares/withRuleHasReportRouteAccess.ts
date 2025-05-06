import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import {
  ApiEndpoints,
  AppRoutes,
  extractReportVersionId,
  fetchResponse,
  getUserRole,
  REPORT_APP_BASE,
  REPORT_BASE,
  REPORT_VERSION_API_BASE,
  REPORTING_BASE,
  reportRoutesLFO,
  reportRoutesReportingOperation,
  reportRoutesSubmitted,
  restrictedRoutesEIO,
  restrictedRoutesNewEntrant,
  restrictedRoutesSubmitted,
} from "./constants";
import {
  ELECTRICITY_IMPORT_OPERATION,
  NEW_ENTRANT_REGISTRATION_PURPOSE,
  REPORTING_OPERATION,
} from "@reporting/src/app/utils/constants";
import {
  IDP,
  OperationTypes,
  ReportOperationStatus,
} from "@bciers/utils/src/enums";

import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";

/**
 * Defines an extra context that provides caching helpers for API data.
 */
type RuleContext = {
  registrationPurposeCache: Record<number, any>;
  reportOperationCache: Record<number, any>;
  getRegistrationPurpose: (reportVersionId: number, token: any) => Promise<any>;
  getReportOperation: (reportVersionId: number, token: any) => Promise<any>;
};

/**
 * Extended PermissionRule interface that accepts a context parameter.
 */
type PermissionRule = {
  name: string;
  isApplicable: (
    request: NextRequest,
    reportVersionId?: number,
    token?: any,
    context?: RuleContext,
  ) => boolean | Promise<boolean>;
  validate: (
    reportVersionId: number,
    token: any,
    request?: NextRequest,
    context?: RuleContext,
  ) => Promise<boolean> | boolean;
  redirect: (reportVersionId: number, request: NextRequest) => NextResponse;
};

/**
 * Create a new context with caching helpers for this request.
 */
const createRuleContext = (): RuleContext => {
  const registrationPurposeCache: Record<number, any> = {};
  const reportOperationCache: Record<number, any> = {};

  return {
    registrationPurposeCache,
    reportOperationCache,
    getRegistrationPurpose: async (reportVersionId: number, token: any) => {
      if (!registrationPurposeCache[reportVersionId]) {
        registrationPurposeCache[reportVersionId] = await fetchResponse(
          `${REPORT_VERSION_API_BASE}${reportVersionId}${ApiEndpoints.REGISTRATION_PURPOSE}`,
          token.user_guid,
        );
      }
      return registrationPurposeCache[reportVersionId];
    },
    getReportOperation: async (reportVersionId: number, token: any) => {
      if (!reportOperationCache[reportVersionId]) {
        reportOperationCache[reportVersionId] = await fetchResponse(
          `${REPORT_VERSION_API_BASE}${reportVersionId}${ApiEndpoints.REPORT_OPERATION}`,
          token.user_guid,
        );
      }
      return reportOperationCache[reportVersionId];
    },
  };
};

/**
 * Permission rules for route access.
 */
export const permissionRules: PermissionRule[] = [
  // Rule: check access to restricted New Entrant routes
  {
    name: "accessNewEntrant",
    isApplicable: (request, reportVersionId) =>
      Boolean(
        reportVersionId &&
          restrictedRoutesNewEntrant.some((path) =>
            request.nextUrl.pathname.includes(path),
          ),
      ),
    validate: async (reportVersionId, token, _request, context) => {
      const registrationPurpose = await context!.getRegistrationPurpose(
        reportVersionId,
        token,
      );
      return (
        registrationPurpose?.registration_purpose ===
        NEW_ENTRANT_REGISTRATION_PURPOSE
      );
    },
    redirect: (reportVersionId, request) =>
      NextResponse.redirect(
        new URL(
          `${REPORT_APP_BASE}${reportVersionId}${AppRoutes.OPERATION}`,
          request.url,
        ),
      ),
  },
  // Rule: check access to restricted EIO routes
  {
    name: "accessEIO",
    isApplicable: (request, reportVersionId) =>
      Boolean(
        reportVersionId &&
          restrictedRoutesEIO.some((path) =>
            request.nextUrl.pathname.includes(path),
          ),
      ),
    validate: async (reportVersionId, token, _request, context) => {
      const registrationPurpose = await context!.getRegistrationPurpose(
        reportVersionId,
        token,
      );
      return (
        registrationPurpose?.registration_purpose ===
        ELECTRICITY_IMPORT_OPERATION
      );
    },
    redirect: (reportVersionId, request) =>
      NextResponse.redirect(
        new URL(
          `${REPORT_APP_BASE}${reportVersionId}${AppRoutes.OPERATION}`,
          request.url,
        ),
      ),
  },
  // Rule: check access to restricted LFO routes
  {
    name: "accessLFO",
    isApplicable: (request, reportVersionId) =>
      Boolean(
        reportVersionId &&
          reportRoutesLFO.some((path) =>
            request.nextUrl.pathname.includes(path),
          ),
      ),
    validate: async (reportVersionId, token, _request, context) => {
      const reportOperation = await context!.getReportOperation(
        reportVersionId,
        token,
      );
      return reportOperation?.operation_type === OperationTypes.LFO;
    },
    redirect: (reportVersionId, request) =>
      NextResponse.redirect(
        new URL(
          `${REPORT_APP_BASE}${reportVersionId}${AppRoutes.OPERATION}`,
          request.url,
        ),
      ),
  },
  // Rule: check access to restricted submitted routes
  {
    name: "accessSubmitted",
    isApplicable: (request, reportVersionId) =>
      Boolean(
        reportVersionId &&
          restrictedRoutesSubmitted.some((path) =>
            request.nextUrl.pathname.includes(path),
          ),
      ),
    validate: async (reportVersionId, token, _request, context) => {
      const reportOperation = await context!.getReportOperation(
        reportVersionId,
        token,
      );

      return (
        reportOperation?.operation_report_status ===
        ReportOperationStatus.SUBMITTED
      );
    },

    redirect: (reportVersionId, request) =>
      NextResponse.redirect(
        new URL(
          `${REPORT_APP_BASE}${reportVersionId}${AppRoutes.OPERATION}`,
          request.url,
        ),
      ),
  },
  // Rule: check access to restricted Verification route
  {
    name: "showVerification",
    isApplicable: (request, reportVersionId) => {
      const { pathname } = request.nextUrl;
      // use regex for accurately matching in-case of future verification type routes
      const pathRegex = new RegExp(
        `^(\\/${REPORTING_BASE})?\\/${REPORT_BASE}\\/\\d+\\${AppRoutes.VERIFICATION}$`,
      );
      return Boolean(reportVersionId && pathname.match(pathRegex));
    },
    validate: async (reportVersionId) => {
      const needsVerification =
        await getReportNeedsVerification(reportVersionId);
      return needsVerification.show_verification_page;
    },
    redirect: (reportVersionId, request) =>
      NextResponse.redirect(
        new URL(
          `${REPORT_APP_BASE}${reportVersionId}${AppRoutes.OPERATION}`,
          request.url,
        ),
      ),
  },
  // Rule for submitted report routing
  {
    name: "routeSubmittedReport",
    isApplicable: async (request, reportVersionId, token) => {
      const reportOperation = await fetchResponse(
        `${REPORT_VERSION_API_BASE}${reportVersionId}${ApiEndpoints.REPORT_OPERATION}`,
        token.user_guid,
      );
      return (
        reportOperation?.operation_report_status ===
        ReportOperationStatus.SUBMITTED
      );
    },
    validate: (reportVersionId, token, request) => {
      if (
        !reportRoutesSubmitted.some(
          (path) => request?.nextUrl.pathname.includes(path),
        )
      ) {
        return false;
      }
      return true;
    },
    redirect: (reportVersionId, request) =>
      NextResponse.redirect(
        new URL(
          `${REPORT_APP_BASE}${reportVersionId}${AppRoutes.SUBMITTED}`,
          request.url,
        ),
      ),
  },
  // Rule for Reporting Operation routing
  {
    name: "routeReportingOperation",
    isApplicable: async (request, reportVersionId, token) => {
      const registrationPurpose = await fetchResponse(
        `${REPORT_VERSION_API_BASE}${reportVersionId}${ApiEndpoints.REGISTRATION_PURPOSE}`,
        token.user_guid,
      );
      return registrationPurpose?.registration_purpose === REPORTING_OPERATION;
    },
    validate: (reportVersionId, token, request) => {
      if (
        !reportRoutesReportingOperation.some(
          (path) => request?.nextUrl.pathname.includes(path),
        )
      ) {
        return false;
      }
      return true;
    },
    redirect: (reportVersionId, request) =>
      NextResponse.redirect(
        new URL(
          `${REPORT_APP_BASE}${reportVersionId}${AppRoutes.OPERATION}`,
          request.url,
        ),
      ),
  },
];

/**
 * Checks if the incoming request has access to the desired path by evaluating it against
 * a set of permission rules.
 */
const checkHasPathAccess = async (request: NextRequest, token: any) => {
  try {
    const { pathname } = request.nextUrl;
    const reportVersionId = extractReportVersionId(pathname);
    // Create a caching context for this request
    const context = createRuleContext();
    // Iterate over each rule and validate if it applies
    for (const rule of permissionRules) {
      if (reportVersionId) {
        if (await rule.isApplicable(request, reportVersionId, token, context)) {
          const isValid = await rule.validate(
            reportVersionId,
            token,
            request,
            context,
          );
          if (!isValid) {
            return rule.redirect(reportVersionId, request);
          }
        }
      }
    }
  } catch (error) {
    // Fallback: Redirect to the onboarding/dashboard page on error
    return NextResponse.redirect(new URL(AppRoutes.ONBOARDING, request.url));
  }
  // Proceed if all rules pass
  return null;
};

export const withRuleHasReportRouteAccess: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const token = await getToken();
    const role = getUserRole(token);
    // Apply industry user-specific routing rules
    if (role === IDP.BCEIDBUSINESS) {
      try {
        const response = await checkHasPathAccess(request, token);
        if (response) {
          return response;
        }
      } catch (error) {
        return NextResponse.redirect(
          new URL(`${REPORT_APP_BASE}`, request.url),
        );
      }
    }
    return next(request, _next);
  };
};
