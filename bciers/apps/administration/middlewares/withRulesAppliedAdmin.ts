import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import { IDP } from "@bciers/utils/enums";
import { OperatorStatus, UserOperatorStatus } from "@bciers/utils/enums";

/*
  Middleware to apply business rules.
 */

const appName = "administration";
export const withRulesAppliedAdmin: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;
    const token = await getToken();

    // 📏 Industry user rules...
    if (token.identity_provider === IDP.BCEIDBUSINESS) {
      const baseApiUrl = `${process.env.API_URL}registration/`;
      const baseAppUrl = `${appName}/`;
      const options: RequestInit = {
        cache: "no-store", // Default cache option
        method: "GET",
        headers: new Headers({
          Authorization: JSON.stringify({
            user_guid: token.user_guid,
          }),
        }),
      };
      if (pathname.includes("operations")) {
        // 📏 Industry users are only allowed to see their operations if their operator is pending/approved
        try {
          const response = await fetch(
            `${baseApiUrl}user-operators/current`,
            options,
          );
          const operator = await response.json();
          if (operator.status !== "Pending" && operator.status !== "Approved") {
            // 🛸 Redirect to root app router page - dashboard
            return NextResponse.redirect(new URL(`/${appName}`, request.url));
          }
        } catch (error) {
          throw error;
        }
      }
      if (pathname.endsWith("select-operator")) {
        // 📏 Manage select-operator flow: select; request access; approved
        try {
          const response = await fetch(
            `${baseApiUrl}user-operators/pending`,
            options,
          );
          const userOperator = await response.json();
          const { status, operatorId, operatorStatus, operatorLegalName } =
            userOperator;

          if (status === UserOperatorStatus.APPROVED) {
            // 🛸 Redirect to the approved user's operator - my-operator
            return NextResponse.redirect(new URL(`my-operator`, request.url));
          }

          if (
            status === UserOperatorStatus.PENDING ||
            operatorStatus === OperatorStatus.DRAFT
          ) {
            // 🛸 Redirect to the request access operator
            return NextResponse.redirect(
              new URL(
                `select-operator/received/request-access/${operatorId}?title=${operatorLegalName}`,
                request.url,
              ),
            );
          }
        } catch (error) {
          throw error;
        }
      }
    }

    // 🛸 Route to next middleware
    return next(request, _next);
  };
};
