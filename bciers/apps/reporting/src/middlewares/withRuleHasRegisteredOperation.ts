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
  REPORTING_BASE,
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
const checkHasRegisteredOperation = async (
  request: NextRequest,
  token: any,
) => {
  try {
    // 📏 Rule: Check if the userOperator's operator has a registered operation
    let response = await fetchResponse(
      "registration/user-operators/current/has_registered_operation",
      token.user_guid,
    );
    // If required no registered operation, redirect to the onboarding page
    if (response.has_registered_operation !== true) {
      // 🛸 Redirect to BCIERS dashboard
      return NextResponse.redirect(new URL(AppRoutes.ONBOARDING, request.url));
    }
    // Check if a reportVersionId is valid
    const { pathname } = request.nextUrl;
    const reportVersionId = extractReportVersionId(pathname);
    // Check if reportVersionId is a valid number before proceeding
    if (typeof reportVersionId === "number" && !isNaN(reportVersionId)) {
      // Check if this reportVersionId is a valid report for this user
      response = await fetchResponse(
        `${REPORTING_BASE}/operations`,
        token.user_guid,
      );
      // Extract all valid report_version_id values from the response (ignoring null values)
      const reportVersionIds = response.items
        .map((item: { report_version_id: any }) => item.report_version_id)
        .filter((id: null | undefined) => id !== null && id !== undefined);

      // Validate if the reportVersionId extracted from the URL matches any value from the response
      const isValidReportVersion = reportVersionIds.includes(reportVersionId);
      if (!isValidReportVersion) {
        // 🛸 Redirect to reports grid
        return NextResponse.redirect(
          new URL(`${REPORT_APP_BASE}`, request.url),
        );
      }
    }
  } catch (error) {
    // 🛸 Redirect to BCIERS dashboard
    return NextResponse.redirect(new URL(AppRoutes.ONBOARDING, request.url));
  }

  // 🛸 No redirect required, proceed to the next middleware
  return null;
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
        const response = await checkHasRegisteredOperation(request, token);
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
