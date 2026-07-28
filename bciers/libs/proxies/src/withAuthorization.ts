import {
  NextFetchEvent,
  NextProxy,
  NextRequest,
  NextResponse,
} from "next/server";
import { ProxyFactory, DashboardRoutes } from "@bciers/proxies";
import { actionHandler, getToken } from "@bciers/actions";

/*
Access control logic is managed using Next.js proxy and NextAuth.js authentication JWT token.
The proxy intercepts requests, and for restricted areas...
Checks for a valid user token to continue to next proxy else redirects to onboarding
 */

// Proxy for authorization
export const withAuthorization: ProxyFactory = (next: NextProxy) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    try {
      // Check if the user is authenticated via the jwt encoded in server side cookie
      const token = await getToken();

      if (token) {
        const response = await actionHandler(
          `registration/user/user-is-archived`,
          "GET",
        );
        if (response === true) {
          return NextResponse.redirect(
            new URL(DashboardRoutes.DECLINE, request.url),
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
    } catch (error) {
      // Prevent redirect loops if the error route itself runs through this proxy
      if (request.nextUrl.pathname === DashboardRoutes.ERROR) {
        return next(request, _next);
      }

      return NextResponse.redirect(new URL(DashboardRoutes.ERROR, request.url));
    }
  };
};
