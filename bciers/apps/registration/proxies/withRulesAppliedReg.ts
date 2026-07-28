import {
  NextFetchEvent,
  NextProxy,
  NextRequest,
  NextResponse,
} from "next/server";
import { ProxyFactory, DashboardRoutes } from "@bciers/proxies";
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
      return NextResponse.redirect(
        new URL(DashboardRoutes.ONBOARDING, request.url),
      );
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
      return NextResponse.redirect(
        new URL(DashboardRoutes.ONBOARDING, request.url),
      );
    }
  } catch (_error) {
    // 🛸 Redirect to BCIERS dashboard error
    return NextResponse.redirect(new URL(DashboardRoutes.ERROR, request.url));
  }

  // 🛸 No redirect required, proceed to the next proxy
  return null;
};

/**
 * 🚀 Proxy to apply business rules for routing in the registration app.
 */
export const withRulesAppliedReg: ProxyFactory = (next: NextProxy) => {
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
      } catch (_error) {
        // 🛸 Redirect to BCIERS dashboard
        return NextResponse.redirect(
          new URL(DashboardRoutes.ONBOARDING, request.url),
        );
      }
    }

    // 🛸 Proceed to the next proxy
    return next(request, _next);
  };
};
