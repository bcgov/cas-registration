import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import {
  extractReportVersionId,
  getUserRole,
  REPORT_APP_BASE,
  REPORT_BASE,
  REPORTING_BASE,
  AppRoutes,
  reportRoutesLFO,
  reportRoutesReportingOperation,
  reportRoutesSubmitted,
  reportRoutesEIO,
  restrictedRoutesEIO,
  restrictedRoutesNewEntrant,
  restrictedRoutesSubmitted,
  restrictedSupplementaryReport,
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
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";

/**
 * Defines an extra context that provides caching helpers for API data.
 */
type RuleContext = {
  registrationPurposeCache: Record<number, any>;
  reportOperationCache: Record<number, any>;
  reportVerificationStatusCache: Record<number, any>;
  isSupplementaryReportCache: Record<number, any>;
  getRegistrationPurpose: (reportVersionId: number) => Promise<any>;
  getReportOperation: (reportVersionId: number) => Promise<any>;
  getReportVerificationStatus: (reportVersionId: number) => Promise<any>;
  getIsSupplementaryReport: (reportVersionId: number) => Promise<any>;
};

/**
 * Extended PermissionRule interface that accepts a context parameter.
 */
type PermissionRule = {
  name: string;
  isApplicable: (
    request: NextRequest,
    reportVersionId: number,
    context?: RuleContext,
  ) => boolean | Promise<boolean>;
  validate: (
    reportVersionId: number,
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
  const reportVerificationStatusCache: Record<number, any> = {};
  const isSupplementaryReportCache: Record<number, any> = {};

  return {
    registrationPurposeCache,
    reportOperationCache,
    reportVerificationStatusCache,
    isSupplementaryReportCache,
    getRegistrationPurpose: async (reportVersionId: number) => {
      if (!registrationPurposeCache[reportVersionId]) {
        registrationPurposeCache[reportVersionId] =
          await getRegistrationPurpose(reportVersionId);
      }
      return registrationPurposeCache[reportVersionId];
    },
    getReportOperation: async (reportVersionId: number) => {
      if (!reportOperationCache[reportVersionId]) {
        reportOperationCache[reportVersionId] =
          await getReportingOperation(reportVersionId);
      }
      return reportOperationCache[reportVersionId];
    },
    getReportVerificationStatus: async (reportVersionId: number) => {
      if (!reportVerificationStatusCache[reportVersionId]) {
        reportVerificationStatusCache[reportVersionId] =
          await getReportVerificationStatus(reportVersionId);
      }
      return reportVerificationStatusCache[reportVersionId];
    },
    getIsSupplementaryReport: async (reportVersionId: number) => {
      if (!isSupplementaryReportCache[reportVersionId]) {
        isSupplementaryReportCache[reportVersionId] =
          await getIsSupplementaryReport(reportVersionId);
      }
      return isSupplementaryReportCache[reportVersionId];
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
    isApplicable: (request) =>
      Boolean(
        restrictedRoutesNewEntrant.some((path) =>
          request.nextUrl.pathname.includes(path),
        ),
      ),
    validate: async (reportVersionId, _request, context) => {
      const registrationPurpose =
        await context!.getRegistrationPurpose(reportVersionId);
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
    isApplicable: (request) =>
      Boolean(
        restrictedRoutesEIO.some((path) =>
          request.nextUrl.pathname.includes(path),
        ),
      ),
    validate: async (reportVersionId, _request, context) => {
      const registrationPurpose =
        await context!.getRegistrationPurpose(reportVersionId);
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
    isApplicable: (request) =>
      Boolean(
        reportRoutesLFO.some((path) => request.nextUrl.pathname.includes(path)),
      ),
    validate: async (reportVersionId, _request, context) => {
      const reportOperation =
        await context!.getReportOperation(reportVersionId);
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
    isApplicable: (request) =>
      Boolean(
        restrictedRoutesSubmitted.some((path) =>
          request.nextUrl.pathname.includes(path),
        ),
      ),
    validate: async (reportVersionId, _request, context) => {
      const reportOperation =
        await context!.getReportOperation(reportVersionId);

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
    name: "accessVerification",
    isApplicable: (request) => {
      const { pathname } = request.nextUrl;
      // use regex for accurately matching in-case of future verification type routes
      const pathRegex = new RegExp(
        `^(\\/${REPORTING_BASE})?\\/${REPORT_BASE}\\/\\d+\\${AppRoutes.VERIFICATION}$`,
      );
      return Boolean(pathname.match(pathRegex));
    },
    validate: async (reportVersionId, _request, context) => {
      const verificationStatus =
        await context!.getReportVerificationStatus(reportVersionId);
      return verificationStatus.show_verification_page;
    },
    redirect: (reportVersionId, request) =>
      NextResponse.redirect(
        new URL(
          `${REPORT_APP_BASE}${reportVersionId}${AppRoutes.OPERATION}`,
          request.url,
        ),
      ),
  },
  // Rule: check access to supplementary report routes
  {
    name: "accessSupplementaryReport",
    isApplicable: (request) =>
      Boolean(
        restrictedSupplementaryReport.some((path) =>
          request.nextUrl.pathname.includes(path),
        ),
      ),
    validate: async (reportVersionId, _request, context) => {
      const isSupplementaryReport =
        await context!.getIsSupplementaryReport(reportVersionId);

      return isSupplementaryReport === true;
    },
    redirect: (reportVersionId, request) =>
      NextResponse.redirect(
        new URL(
          `${REPORT_APP_BASE}${reportVersionId}${AppRoutes.REVIEW}`,
          request.url,
        ),
      ),
  },
  // Rule for submitted report routing
  {
    name: "routeSubmittedReport",
    isApplicable: async (_request, reportVersionId, context) => {
      const reportOperation =
        await context!.getReportOperation(reportVersionId);

      return (
        reportOperation?.operation_report_status ===
        ReportOperationStatus.SUBMITTED
      );
    },
    validate: (_reportVersionId, request) => {
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
    isApplicable: async (_request, reportVersionId, context) => {
      const registrationPurpose =
        await context!.getRegistrationPurpose(reportVersionId);
      return registrationPurpose?.registration_purpose === REPORTING_OPERATION;
    },
    validate: (_reportVersionId, request) => {
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
  // Rule for EIO report routing
  {
    name: "routeEIOReport",
    isApplicable: async (_request, reportVersionId, context) => {
      const registrationPurpose =
        await context!.getRegistrationPurpose(reportVersionId);
      return (
        registrationPurpose?.registration_purpose ===
        ELECTRICITY_IMPORT_OPERATION
      );
    },
    validate: (_reportVersionId, request) => {
      if (
        !reportRoutesEIO.some(
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
const checkHasPathAccess = async (request: NextRequest) => {
  try {
    const { pathname } = request.nextUrl;
    const reportVersionId = extractReportVersionId(pathname);
    if (!reportVersionId) return null;
    // Create a caching context for this request
    const context = createRuleContext();
    // Iterate over each rule and validate if it applies
    for (const rule of permissionRules) {
      if (await rule.isApplicable(request, reportVersionId, context)) {
        const isValid = await rule.validate(reportVersionId, request, context);

        if (!isValid) {
          return rule.redirect(reportVersionId, request);
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
        const response = await checkHasPathAccess(request);
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
