import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import { IDP } from "@bciers/utils/src/enums";
import {
  REPORT_APP_BASE,
  AppRoutes,
  extractReportVersionId,
  fetchResponse,
  getUserRole,
} from "./constants";

/**
 * 📏 Handles routing access for industry users based on:
 * if the userOperator's operator has a registered operation
 *
 * @param request - The incoming request object.
 * @param token - The user's authentication token.
 * @returns A response if a redirect is required, otherwise null.
 */
const checkUserStatus = async (request: NextRequest, token: any) => {
  try {
    // 📏 Extract the report version from the URL
    const { pathname } = request.nextUrl;
    const reportVersionId = extractReportVersionId(pathname);

    // 🛸 Make a single API call to validate the user and, if necessary, report version
    let response = await fetchResponse(
      `reporting/validate_user_report_version?report_version_id=${reportVersionId}`,
      token.user_guid,
    );

    // Handle the response statuses
    switch (response.status) {
      case "Not Registered":
        // 🛸 Redirect to onboarding page if the user is not registered
        return NextResponse.redirect(
          new URL(AppRoutes.ONBOARDING, request.url),
        );

      case "Registered and Valid Report Version":
        // 🛸 Proceed if the report version is valid
        return null;

      case "Registered and Invalid Report Version":
        // 🛸 Redirect to the reports grid page if the report version is invalid
        return NextResponse.redirect(
          new URL(`${REPORT_APP_BASE}`, request.url),
        );

      case "Registered":
        // 🛸 If no report version is present, just proceed as registered user
        return null;

      default:
        return null;
    }
  } catch (error) {
    // 🛸 Handle error (e.g., redirect to onboarding in case of failure)
    return NextResponse.redirect(new URL(AppRoutes.ONBOARDING, request.url));
  }
};

/**
 * 🚀 Middleware to apply business rules for routing in the reporting app.
 */
export const withRuleHasRegisteredOperation: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const token = await getToken();
    const role = getUserRole(token);
    // 📏 Apply industry user-specific routing rules
    if (role === IDP.BCEIDBUSINESS) {
      try {
        const response = await checkUserStatus(request, token);
        // If a response is returned from the route handler, redirect
        if (response) {
          return response;
        }
      } catch (error) {
        // 🛸 Redirect to BCIERS dashboard
        return NextResponse.redirect(
          new URL(AppRoutes.ONBOARDING, request.url),
        );
      }
    }
    // 🛸 Proceed to the next middleware
    return next(request, _next);
  };
};
