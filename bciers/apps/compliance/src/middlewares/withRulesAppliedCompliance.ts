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

const handleIndustryUserRoutes = async (request: NextRequest, token: any) => {
  try {
    const operatorFields = await fetchApi(
      "registration/user-operators/current/has_registered_operation",
      {
        user_guid: token.user_guid,
      },
    );
    if (operatorFields.has_registered_operation !== true) {
      return NextResponse.redirect(new URL(`/onboarding`, request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL(`/onboarding`, request.url));
  }
  return null;
};

export const withRulesAppliedCompliance: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const token = await getToken();
    if (token?.identity_provider === IDP.BCEIDBUSINESS) {
      try {
        const response = await handleIndustryUserRoutes(request, token);
        if (response) {
          return response;
        }
      } catch (error) {
        return NextResponse.redirect(new URL(`/onboarding`, request.url));
      }
    }
    return next(request, _next);
  };
};
