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
 * if user has operator access
 * if the operator has all required fields filled
 *
 * @param request - The incoming request object.
 * @param token - The user's authentication token.
 * @returns A response if a redirect is required, otherwise null.
 */
const handleIndustryUserRoutes = async (request: NextRequest, token: any) => {
  try {
    // 📏 Rule: Industry users can only proceed to registration if they have operator access
    const userOperator = await fetchApi("registration/user-operators/current", {
      user_guid: token.user_guid,
    });

    // If user does not have an operator, redirect to the onboarding page
    if (!userOperator) {
      // 🛸 Redirect to BCIERS dashboard
      return NextResponse.redirect(new URL(`/onboarding`, request.url));
    }

    // 📏 Rule: Check if the operator has all required fields filled
    const operatorFields = await fetchApi(
      "registration/user-operators/current/has-required-fields",
      {
        user_guid: token.user_guid,
      },
    );

    // If required fields are missing, redirect to the onboarding page
    if (operatorFields.has_required_fields !== true) {
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
export const withRulesAppliedReg: MiddlewareFactory = (
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
