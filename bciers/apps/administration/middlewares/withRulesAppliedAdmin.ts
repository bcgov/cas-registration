import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import {
  IDP,
  OperatorStatus,
  UserOperatorStatus,
} from "@bciers/utils/src/enums";
import { fetchApi } from "@bciers/actions/api/fetchApi";
import { appName } from "../middleware";

/**
 * 📏 Handles routing for industry users based on:
 * Industry users can only see operations if their operator is pending/approved
 * Industry users can only see contacts if they have operator access
 * Manages the select-operator flow
 *
 * @param request - The incoming request object.
 * @param token - The user's authentication token.
 * @returns A response if a redirect is required, otherwise null.
 */
const handleIndustryUserRoutes = async (request: NextRequest, token: any) => {
  const { pathname } = request.nextUrl;

  // 📏 Rule: Industry users can only see operations if their userOperator is approved
  if (pathname.includes("operations")) {
    const userOperator = await fetchApi("registration/user-operators/current", {
      user_guid: token.user_guid,
    });
    if (!userOperator || userOperator?.status !== UserOperatorStatus.APPROVED) {
      // 🛸 Redirect to the app's root page (dashboard)
      return NextResponse.redirect(new URL(`/${appName}`, request.url));
    }
  }

  // 📏 Rule: Manage the select-operator flow for industry users
  if (pathname.endsWith("select-operator")) {
    try {
      const userOperator = await fetchApi(
        "registration/user-operators/current",
        {
          user_guid: token.user_guid,
        },
      );

      // 🧩 If there is no userOperator, proceed to the next middleware
      if (!userOperator) {
        return null; // No redirect required, continue to the next middleware
      }

      const { status, operatorId, operatorStatus, operatorLegalName } =
        userOperator;

      if (status === UserOperatorStatus.APPROVED) {
        // 🛸 Redirect to the user's approved operator
        return NextResponse.redirect(new URL(`my-operator`, request.url));
      }

      if (
        status === UserOperatorStatus.PENDING ||
        operatorStatus === OperatorStatus.DRAFT
      ) {
        // 🛸 Redirect to the request-access operator page
        return NextResponse.redirect(
          new URL(
            `select-operator/received/request-access/${operatorId}?title=${operatorLegalName}`,
            request.url,
          ),
        );
      }
    } catch (error) {
      // Proceed to next middleware in case of error
      return null;
    }
  }

  // 📏 Rule: Industry users can only see contacts if they have operator access
  if (pathname.includes("contacts")) {
    const userOperator = await fetchApi("registration/user-operators/current", {
      user_guid: token.user_guid,
    });

    if (userOperator.status !== UserOperatorStatus.APPROVED) {
      // 🛸 Redirect to the root app router page - dashboard
      return NextResponse.redirect(new URL(`/${appName}`, request.url));
    }
  }

  // 🛸 No redirect required, proceed to the next middleware
  return null;
};

/**
 * 🚀 Middleware to apply business rules for routing in the administration app.
 */
export const withRulesAppliedAdmin: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const token = await getToken();

    // 📏 Apply industry user-specific routing rules
    if (token.identity_provider === IDP.BCEIDBUSINESS) {
      try {
        const response = await handleIndustryUserRoutes(request, token);
        if (response) {
          // 🛸 Redirect if a response is returned from the route handler
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
