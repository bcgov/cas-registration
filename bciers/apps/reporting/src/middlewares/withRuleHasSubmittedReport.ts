import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import { IDP } from "@bciers/utils/src/enums";
import { ReportOperationStatus } from "@bciers/utils/src/enums";
import {
  getUserRole,
  fetchResponse,
  routes,
  extractReportVersionId,
} from "./constants";

/**
 * 📏 Handles routing access for industry users based:
 * if the report version status is submitted, route only to submitted
 *
 * @param request - The incoming request object.
 * @returns A response if a redirect is required, otherwise null.
 */
const checkHasSubmittedReport = async (request: NextRequest, token: any) => {
  try {
    const { pathname } = request.nextUrl;
    const reportVersionId = extractReportVersionId(pathname);

    if (reportVersionId) {
      const submittedPathRegex = new RegExp(
        `^(\\/reporting)?\\/reports\\/\\d+\\/${routes.SUBMITTED}$`,
      );

      const reportOperation = await fetchResponse(
        `reporting/report-version/${reportVersionId}/report-operation`,
        token.user_guid,
      );

      const isSubmitted =
        reportOperation?.operation_report_status ===
        ReportOperationStatus.SUBMITTED;
      const isAccessingSubmitted = pathname.match(submittedPathRegex);

      // ✅ Redirect to SUBMITTED if the report is already submitted and trying to access another page
      if (isSubmitted && !isAccessingSubmitted) {
        return NextResponse.redirect(
          new URL(
            `/reporting/reports/${reportVersionId}/${routes.SUBMITTED}`,
            request.url,
          ),
        );
      }

      // ❌ Prevent access to "SUBMITTED" route if the report is NOT in "SUBMITTED" status
      if (!isSubmitted && isAccessingSubmitted) {
        return NextResponse.redirect(
          new URL(
            `/reporting/reports/${reportVersionId}/${routes.OPERATION}`,
            request.url,
          ),
        );
      }
    }
  } catch (error) {
    // 🛸 Redirect to BCIERS dashboard if an error occurs
    return NextResponse.redirect(new URL(routes.ONBOARDING, request.url));
  }

  // 🛸 No redirect required, proceed to the next middleware
  return null;
};

/**
 * 🚀 Middleware to apply business rules for routing in the reporting app.
 */
export const withRuleHasSubmittedReport: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const token = await getToken();
    const role = getUserRole(token);
    if (role === IDP.BCEIDBUSINESS) {
      // 📏 Apply industry user-specific routing rules
      try {
        const response = await checkHasSubmittedReport(request, token);
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
