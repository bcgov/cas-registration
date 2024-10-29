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

/**
 * 📏 Handles routing for industry users based:
 * if the userOperator's operator has a registered operation
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
  } catch (error) {
    // 🛸 Redirect to BCIERS dashboard
    return NextResponse.redirect(new URL(`/onboarding`, request.url));
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
