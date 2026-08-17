import {
  NextFetchEvent,
  NextProxy,
  NextRequest,
  NextResponse,
} from "next/server";
import { ProxyFactory, DashboardRoutes } from "@bciers/proxies";
import { getToken } from "@bciers/actions";
import { IDP } from "@bciers/utils/src/enums";
import getCurrentUserOperator from "@/administration/app/components/userOperators/getCurrentUserOperator";
import getCurrentUserOperatorWithRequiredFields from "@/registration/app/utils/getCurrentUserOperatorWithRequiredFields";

/**
 * 📏 Handles routing for industry users based:
 * if user has operator access
 * if the operator has all required fields filled
 *
 * @param request - The incoming request object.
 * @returns A response if a redirect is required, otherwise null.
 */
const handleIndustryUserRoutes = async (request: NextRequest) => {
  try {
    // 📏 Rule: Industry users can only proceed to registration if they have operator access
    const userOperator = await getCurrentUserOperator();

    // If user does not have an operator, redirect to the onboarding page
    if (!userOperator) {
      // 🛸 Redirect to BCIERS dashboard
      return NextResponse.redirect(
        new URL(DashboardRoutes.ONBOARDING, request.url),
      );
    }

    // 📏 Rule: Check if the operator has all required fields filled
    const operatorFields = await getCurrentUserOperatorWithRequiredFields();

    // If required fields are missing, redirect to the onboarding page
    if (operatorFields.has_required_fields !== true) {
      // 🛸 Redirect to BCIERS dashboard
      return NextResponse.redirect(
        new URL(DashboardRoutes.ONBOARDING, request.url),
      );
    }
  } catch (_error) {
    // 🛸 Redirect to BCIERS error page
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
        const response = await handleIndustryUserRoutes(request);

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
