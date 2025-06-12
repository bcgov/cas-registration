import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import isInAllowedPath from "@bciers/utils/src/isInAllowedList";
import { FrontEndRoles } from "@bciers/utils/src/enums";
/*
Access control logic is managed using Next.js middleware and NextAuth.js authentication JWT session.
The middleware intercepts requests, and for restricted areas...
Checks for a valid user session, and extracts user information from the JWT session.
Based on JWT properties of identity_provider and role, the middleware dynamically rewrites the request URL
to the appropriate folder structure.
 */
const paths = {
  auth: "auth",
  unauth: "unauth",
  onboarding: "onboarding",
  dashboard: "dashboard",
  profile: "profile",
  declined: "declined",
  administration: "administration",
};
export const authAllowedPaths = [paths.dashboard, paths.profile];
const unauthAllowedPaths = [paths.auth, paths.unauth, paths.declined];

// Middleware for authorization
export const withAuthorizationDashboard: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;

    const routeWithNoToken = () => {
      if (pathname.endsWith(`/${paths.onboarding}`)) {
        // 🛸 Route to next middleware
        return next(request, _next);
      } else {
        // 🛸 Redirect to onboarding
        return NextResponse.redirect(
          new URL(`/${paths.onboarding}`, request.url),
        );
      }
    };

    const routeWithNoAppRole = () => {
      if (pathname.endsWith(`/${paths.profile}`)) {
        // route to next middleware
        return next(request, _next);
      } else {
        return NextResponse.redirect(
          new URL(`/${paths.administration}/${paths.profile}`, request.url),
        );
      }
    };

    const routeForRoleCasPending = () => {
      if (isInAllowedPath(pathname, authAllowedPaths)) {
        // 🛸 Route to next middleware
        return next(request, _next);
      } else {
        // 🛸 Redirect to dashboard
        return NextResponse.redirect(
          new URL(`/${paths.dashboard}`, request.url),
        );
      }
    };

    const routeForOtherAppRoles = () => {
      if (pathname === "/" || pathname === `/${paths.onboarding}`) {
        // 🛸 Redirect to dashboard
        return NextResponse.redirect(
          new URL(`/${paths.dashboard}`, request.url),
        );
      } else {
        // 🛸 Route to next middleware
        return next(request, _next);
      }
    };

    // Check if the path is in the unauthenticated allow list
    if (isInAllowedPath(pathname, unauthAllowedPaths)) {
      // 🛸 Route to next middleware
      return next(request, _next);
    }

    // Check if the user is authenticated via the jwt encoded in server side cookie
    const token = await getToken();
    if (token) {
      // Handle user without token.user.app_role
      if (!token.app_role || token.app_role === "") {
        return routeWithNoAppRole();
      }
      // Handle user with token.user.app_role = cas_pending
      if (token.app_role === FrontEndRoles.CAS_PENDING) {
        return routeForRoleCasPending();
      }
      // else Handle user with token.user.app_role that isn't cas_pending
      return routeForOtherAppRoles();
    } else {
      return routeWithNoToken();
    }
  };
};
