import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import { IDP } from "@bciers/utils/src/enums";
import { OperationTypes } from "@bciers/utils/src/enums";
import {
  getUserRole,
  fetchResponse,
  routes,
  extractReportVersionId,
  reportPathsLFO,
} from "./constants";

/**
 * 📏 Handles routing access for industry users based:
 * if the report type needs verification for access to verification
 * if the report type is LFO for access to LFO paths
 *
 * @param request - The incoming request object.
 * @returns A response if a redirect is required, otherwise null.
 */
const checkHasPathAccess = async (request: NextRequest, token: any) => {
  try {
    const { pathname } = request.nextUrl;
    const reportVersionId = extractReportVersionId(pathname);

    // 📏 Rule: allow requests to "verification" only if report needs verification
    const verificationPathRegex = new RegExp(
      `^(\\/reporting)?\\/reports\\/\\d+\\/${routes.VERIFICATION}$`,
    );
    if (reportVersionId && pathname.match(verificationPathRegex)) {
      const needVerification = await fetchResponse(
        `reporting/report-version/${reportVersionId}/report-needs-verification`,
        token.user_guid,
      );
      if (!needVerification) {
        // 🛸 Redirect to final review
        return NextResponse.redirect(
          new URL(
            `/reporting/reports/${reportVersionId}/${routes.FINAL_REVIEW}`,
            request.url,
          ),
        );
      }
    }

    // 📏 Rule: only LFO can route to LFO operation type paths
    if (reportPathsLFO.some((path) => pathname.includes(path))) {
      if (reportVersionId) {
        const reportOperation = await fetchResponse(
          `reporting/report-version/${reportVersionId}/report-operation`,
          token.user_guid,
        );
        if (reportOperation?.operation_type != OperationTypes.LFO) {
          // 🛸 Redirect to review operator
          return NextResponse.redirect(
            new URL(
              `/reporting/reports/${reportVersionId}/${routes.OPERATION}`,
              request.url,
            ),
          );
        }
      }
    }
  } catch (error) {
    // 🛸 Redirect to BCIERS dashboard
    return NextResponse.redirect(new URL(routes.ONBOARDING, request.url));
  }

  // 🛸 No redirect required, proceed to the next middleware
  return null;
};

/**
 * 🚀 Middleware to apply business rules for routing in the reporting app.
 */
export const withRuleHasPathAccess: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const token = await getToken();
    const role = getUserRole(token);
    if (role === IDP.BCEIDBUSINESS) {
      // 📏 Apply industry user-specific routing rules
      try {
        const response = await checkHasPathAccess(request, token);
        // If a response is returned from the route handler, redirect
        if (response) {
          return response;
        }
      } catch (error) {
        // 🛸 Redirect to BCIERS dashboard
        return NextResponse.redirect(new URL(routes.ONBOARDING, request.url));
      }
    }
    // 🛸 Proceed to the next middleware
    return next(request, _next);
  };
};
