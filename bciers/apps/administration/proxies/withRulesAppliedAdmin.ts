import {
  NextFetchEvent,
  NextProxy,
  NextRequest,
  NextResponse,
} from "next/server";
import { ProxyFactory, DashboardRoutes } from "@bciers/proxies";
import { getToken } from "@bciers/actions";
import {
  IDP,
  OperatorStatus,
  UserOperatorStatus,
} from "@bciers/utils/src/enums";
import { appName } from "../proxy";
import getCurrentUserOperator from "@/administration/app/components/userOperators/getCurrentUserOperator";

const getErrorStatus = (error: any): number | undefined => {
  return typeof error?.status === "number" ? error.status : undefined;
};

const isNotFoundError = (error: any): boolean => {
  return getErrorStatus(error) === 404;
};

/**
 * 📏 Handles routing for industry users based on:
 * Industry users can only see operations if their operator is pending/approved
 * Industry users can only see contacts if they have operator access
 * Manages the select-operator flow
 *
 * @param request - The incoming request object.
 * @returns A response if a redirect is required, otherwise null.
 */
const handleIndustryUserRoutes = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const isOperations = pathname.includes("operations");
  const isContacts = pathname.includes("contacts");
  const isSelectOperator = pathname.endsWith("select-operator");

  // Early return if non-relevant route to avoid unneeded API calls
  if (!isOperations && !isContacts && !isSelectOperator) {
    // 🛸 No redirect required, proceed to the next proxy
    return null;
  }

  try {
    let userOperator = null;

    try {
      // Single fetch shared across all route checks
      userOperator = await getCurrentUserOperator();
    } catch (error: any) {
      // Handle missing user-operator record gracefully
      if (isNotFoundError(error)) {
        userOperator = null;
      } else {
        // Re-throw genuine errors
        throw error;
      }
    }

    const isApproved = userOperator?.status === UserOperatorStatus.APPROVED;

    // 📏 Rule: Industry users can only see operations/contacts if their userOperator is approved.
    // If userOperator is null (404), this condition safely triggers a redirect.
    if ((isOperations || isContacts) && !isApproved) {
      // 🛸 Redirect to the app's root page (dashboard)
      return NextResponse.redirect(new URL(`/${appName}`, request.url));
    }

    // 📏 Rule: Manage the select-operator flow for industry users
    if (isSelectOperator && userOperator) {
      const { status, operatorId, operatorStatus, operatorLegalName } =
        userOperator;

      if (status === UserOperatorStatus.APPROVED) {
        // 🛸 Redirect to the user's approved operator
        return NextResponse.redirect(new URL(`my-operator`, request.url));
      }

      const isPendingOrDraft =
        status === UserOperatorStatus.PENDING ||
        operatorStatus === OperatorStatus.DRAFT;

      if (isPendingOrDraft) {
        // 🛸 Redirect to the request-access operator page
        return NextResponse.redirect(
          new URL(
            `select-operator/received/request-access/${operatorId}?title=${operatorLegalName}`,
            request.url,
          ),
        );
      }
    }
  } catch (_error) {
    // 🛸 Redirect to BCIERS error page
    return NextResponse.redirect(new URL(DashboardRoutes.ERROR, request.url));
  }

  // 🛸 No redirect required, proceed to the next proxy
  return null;
};

/**
 * 🚀 Proxy to apply business rules for routing in the administration app.
 */
export const withRulesAppliedAdmin: ProxyFactory = (next: NextProxy) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const token = await getToken();

    // 📏 Apply industry user-specific routing rules
    if (token?.identity_provider === IDP.BCEIDBUSINESS) {
      try {
        const response = await handleIndustryUserRoutes(request);
        if (response) {
          // 🛸 Redirect if a response is returned from the route handler
          return response;
        }
      } catch (_error) {
        // 🛸 Redirect to BCIERS onboarding page on error
        return NextResponse.redirect(
          new URL(DashboardRoutes.ONBOARDING, request.url),
        );
      }
    }

    // 🛸 Proceed to the next proxy
    return next(request, _next);
  };
};
