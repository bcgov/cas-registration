import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import { IDP } from "@bciers/utils/src/enums";
import { fetchApi } from "@bciers/actions/api/fetchApi";

// Paths for LFO operations
export const reportPaths = [
  "review-facilities",
  "report-information",
  "review-facility-information",
  "end-of-facility-report",
  "operation-emission-summary",
];

/**
 * Extracts the report version ID from a given pathname.
 * Assumes the URL follows the pattern: `/reporting/reports/{versionId}/...`
 */
const extractVersionId = (pathname: string): number | null => {
  const parts = pathname.split("/").filter(Boolean);
  const reportsIndex = parts.indexOf("reports");

  if (reportsIndex !== -1 && parts.length > reportsIndex + 1) {
    const versionId = Number(parts[reportsIndex + 1]);
    return Number.isNaN(versionId) ? null : versionId;
  }

  return null;
};

/**
 * 📏 Handles routing access for industry users based:
 * if the userOperator's operator has a registered operation
 * if the operation is SFO routing to LFO path
 * if the operation need verification
 *
 * @param request - The incoming request object.
 * @param token - The user's authentication token.
 * @returns A response if a redirect is required, otherwise null.
 */
const handleIndustryUserRoutes = async (request: NextRequest, token: any) => {
  try {
    // 📏 Rule: Check if the userOperator's operator has a registered operation
    const operatorFields = await fetchApi(
      "registration/user-operators/current/has_registered_operation",
      {
        user_guid: token.user_guid,
      },
    );
    // If required no registered operation, redirect to the onboarding page
    if (operatorFields.has_registered_operation !== true) {
      // 🛸 Redirect to BCIERS dashboard
      return NextResponse.redirect(new URL(`/onboarding`, request.url));
    }
    const { pathname } = request.nextUrl;
    const versionId = extractVersionId(pathname);

    // 📏 Rule: allow requests to "verification" only if report needs verification
    if (
      versionId &&
      pathname.match(/^(\/reporting)?\/reports\/\d+\/verification$/)
    ) {
      const needVerification = await fetchApi(
        `reporting/report-version/${versionId}/report-needs-verification`,
        {
          user_guid: token.user_guid,
        },
      );
      if (!needVerification) {
        // 🛸 Redirect to final review
        return NextResponse.redirect(
          new URL(`/reporting/reports/${versionId}/final-review`, request.url),
        );
      }
    }

    // 📏 Rule: only LFO can route to LFO operation type paths
    if (reportPaths.some((path) => pathname.includes(path))) {
      if (versionId) {
        const reportOperation = await fetchApi(
          `reporting/report-version/${versionId}/report-operation`,
          {
            user_guid: token.user_guid,
          },
        );
        if (
          reportOperation &&
          reportOperation.report_operation.operation_type ===
            "Single Facility Operation"
        ) {
          // 🛸 Redirect to review operator
          return NextResponse.redirect(
            new URL(
              `/reporting/reports/${versionId}/review-operation-information`,
              request.url,
            ),
          );
        }
      }
    }
  } catch (error) {
    // 🛸 Redirect to BCIERS dashboard
    return NextResponse.redirect(new URL(`/onboarding/error`, request.url));
  }

  // 🛸 No redirect required, proceed to the next middleware
  return null;
};

/**
 * 🚀 Middleware to apply business rules for routing in the registration app.
 */
export const withRulesAppliedReport: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const token = await getToken();
    // 📏 Apply industry user-specific routing rules
    if (token?.identity_provider === IDP.BCEIDBUSINESS) {
      try {
        const response = await handleIndustryUserRoutes(request, token);

        // If a response is returned from the route handler, redirect
        if (response) {
          return response;
        }
      } catch (error) {
        // 🛸 Redirect to BCIERS dashboard
        return NextResponse.redirect(new URL(`/onboarding`, request.url));
      }
    }

    // 🛸 Proceed to the next middleware
    return next(request, _next);
  };
};
