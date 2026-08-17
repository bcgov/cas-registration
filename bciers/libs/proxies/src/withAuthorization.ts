import {
  NextFetchEvent,
  NextProxy,
  NextRequest,
  NextResponse,
} from "next/server";
import { DashboardRoutes, ProxyFactory } from "@bciers/proxies";
import { getToken } from "@bciers/actions";
import { isUserArchived } from "@bciers/actions/api";

/*
Access control logic is managed using Next.js proxy and NextAuth.js authentication JWT token.
The proxy intercepts requests, and for restricted areas...
Checks for a valid user token to continue to next proxy else redirects to onboarding
 */

// Proxy for authorization
export const withAuthorization: ProxyFactory = (next: NextProxy) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    // Check if the user is authenticated via the jwt encoded in server side cookie
    const token = await getToken();

    if (token) {
      const isArchived = await isUserArchived();
      if (isArchived === true) {
        return NextResponse.redirect(
          new URL(DashboardRoutes.DECLINED, request.url),
        );
      }
      // 🛸 Route to next proxy
      return next(request, _next);
    } else {
      // 🛸 Redirect unauthenticated requests
      return NextResponse.redirect(
        new URL(DashboardRoutes.ONBOARDING, request.url),
      );
    }
  };
};
