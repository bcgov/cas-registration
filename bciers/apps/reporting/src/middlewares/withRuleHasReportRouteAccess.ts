import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import {
  REPORTING_BASE,
  REPORT_BASE,
  REPORT_VERSION_API_BASE,
  REPORT_APP_BASE,
  extractReportVersionId,
  fetchResponse,
  getUserRole,
  ApiEndpoints,
  AppRoutes,
  reportRoutesLFO,
  reportRoutesEIO,
  reportRoutesSubmitted,
  restrictedRoutesNewEntrant,
  restrictedRoutesEIO,
} from "./constants";
import {
  NEW_ENTRANT_REGISTRATION_PURPOSE,
  ELECTRICITY_IMPORT_OPERATION,
} from "@reporting/src/app/utils/constants";
import {
  OperationTypes,
  ReportOperationStatus,
  IDP,
} from "@bciers/utils/src/enums";
/**
 * Represents a permission rule used to determine access control
 * based on the incoming request and related parameters.
 */
type PermissionRule = {
  name: string;
  isApplicable: (
    request: NextRequest,
    reportVersionId?: number,
    token?: any,
  ) => boolean | Promise<boolean>;
  validate: (
    reportVersionId: number,
    token: any,
    request?: NextRequest,
  ) => Promise<boolean> | boolean;
  redirect: (reportVersionId: number, request: NextRequest) => NextResponse;
};

/**
 * 📏 Handles routing rules for industry users
 *
 * @param request - The incoming request object.
 * @returns A response if a redirect is required, otherwise null.
 */
export const permissionRules: PermissionRule[] = [
  // 📏 Rule: check has access to restricted New Entrant routes
  {
    name: "accessNewEntrant",
    isApplicable: (request, reportVersionId) =>
      Boolean(
        reportVersionId &&
          restrictedRoutesNewEntrant.some((path) =>
            request.nextUrl.pathname.includes(path),
          ),
      ),
    validate: async (reportVersionId, token) => {
      const registrationPurpose = await fetchResponse(
        `${REPORT_VERSION_API_BASE}${reportVersionId}${ApiEndpoints.REGISTRATION_PURPOSE}`,
        token.user_guid,
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
  // 📏 Rule: check has access to restricted EIO routes
  {
    name: "accessEIO",
    isApplicable: (request, reportVersionId) =>
      Boolean(
        reportVersionId &&
          restrictedRoutesEIO.some((path) =>
            request.nextUrl.pathname.includes(path),
          ),
      ),
    validate: async (reportVersionId, token) => {
      const registrationPurpose = await fetchResponse(
        `${REPORT_VERSION_API_BASE}${reportVersionId}${ApiEndpoints.REGISTRATION_PURPOSE}`,
        token.user_guid,
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
  // 📏 Rule: check has access to restricted LFO routes
  {
    name: "accessLFO",
    isApplicable: (request, reportVersionId) =>
      Boolean(
        reportVersionId &&
          reportRoutesLFO.some((path) =>
            request.nextUrl.pathname.includes(path),
          ),
      ),
    validate: async (reportVersionId, token) => {
      const reportOperation = await fetchResponse(
        `${REPORT_VERSION_API_BASE}${reportVersionId}${ApiEndpoints.REPORT_OPERATION}`,
        token.user_guid,
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
  // 📏 Rule: check has access to restricted Verification route
  {
    name: "accessVerification",
    isApplicable: (request, reportVersionId) => {
      const { pathname } = request.nextUrl;
      // use regex for accurately matching in-case of future verification type routes
      const pathRegex = new RegExp(
        `^(\\/${REPORTING_BASE})?\\/${REPORT_BASE}\\/\\d+\\${AppRoutes.VERIFICATION}$`,
      );
      return Boolean(reportVersionId && pathname.match(pathRegex));
    },
    validate: async (reportVersionId, token) => {
      const needsVerification = await fetchResponse(
        `${REPORT_VERSION_API_BASE}${reportVersionId}${ApiEndpoints.NEEDS_VERIFICATION}`,
        token.user_guid,
      );
      return needsVerification;
    },
    redirect: (reportVersionId, request) =>
      NextResponse.redirect(
        new URL(
          `${REPORT_APP_BASE}${reportVersionId}${AppRoutes.OPERATION}`,
          request.url,
        ),
      ),
  },
  // 📏 Rules for EIO operation routing
  {
    name: "routeEIO",
    isApplicable: async (request, reportVersionId, token) => {
      const registrationPurpose = await fetchResponse(
        `${REPORT_VERSION_API_BASE}${reportVersionId}${ApiEndpoints.REGISTRATION_PURPOSE}`,
        token.user_guid,
      );
      return (
        registrationPurpose?.registration_purpose ===
        ELECTRICITY_IMPORT_OPERATION
      );
    },
    validate: (reportVersionId, token, request) => {
      // Return false if the route is not part of reportRoutesEIO
      if (
        !reportRoutesEIO.some(
          (path) => request?.nextUrl.pathname.includes(path),
        )
      ) {
        return false;
      }
      // Otherwise, return true
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
  // 📏 Rule for submitted report routing
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
      // Return false if the route is not part of reportRoutesSubmitted
      if (
        !reportRoutesSubmitted.some(
          (path) => request?.nextUrl.pathname.includes(path),
        )
      ) {
        return false;
      }
      // Otherwise, return true
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
];

/**
 * Checks if the incoming request has access to the desired path by evaluating it against
 * a set of permission rules. It extracts the report version ID from the URL, iterates over
 * each rule, and if a rule applies but the validation fails, it returns a redirect response.
 * If all rules pass or no applicable rule is found, it returns null to allow the requested route.
 */
const checkHasPathAccess = async (request: NextRequest, token: any) => {
  try {
    const { pathname } = request.nextUrl;
    const reportVersionId = extractReportVersionId(pathname);
    // Iterate over each rule and validate if it applies
    for (const rule of permissionRules) {
      if (reportVersionId) {
        // Await the result of isApplicable (and pass the token when needed)
        if (await rule.isApplicable(request, reportVersionId, token)) {
          const isValid = await rule.validate(reportVersionId, token, request);
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
    // 📏 Apply industry user-specific routing rules
    if (role === IDP.BCEIDBUSINESS) {
      try {
        const response = await checkHasPathAccess(request, token);
        // If a response is returned from the route handler, redirect
        if (response) {
          return response;
        }
      } catch (error) {
        // 🛸 Redirect to reports grid
        return NextResponse.redirect(
          new URL(`${REPORT_APP_BASE}`, request.url),
        );
      }
    }
    return next(request, _next);
  };
};
