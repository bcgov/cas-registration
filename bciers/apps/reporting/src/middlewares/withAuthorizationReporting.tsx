import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { MiddlewareFactory } from "@bciers/middlewares/server";
import { getToken } from "@bciers/actions/server";
/*
Access control logic is managed using Next.js middleware and NextAuth.js authentication JWT token.
The middleware intercepts requests, and for restricted areas...
Checks for a valid user session, and extracts user information from the JWT token.
Based on JWT properties of identity_provider and role, the middleware dynamically rewrites the request URL
to the appropriate folder structure.
 */

// Function to check if the path is in the unauthenticated allow list
const isUnauthenticatedAllowListedPath = (pathname: string): boolean => {
  const authList = ["auth", "unauth"];
  return authList.some((path) => pathname.includes(path));
};

// Function to check if the path is in the authenticated allow list
const isAuthenticatedAllowListedPath = (pathname: string): boolean => {
  const allowList = ["dashboard"];
  const lastSegment = pathname.split("/").pop();
  return allowList.includes(lastSegment || "");
};

// Function to check if the path requires authorization
const isAuthorizationRequiredPath = (
  pathname: string,
  token: { identity_provider?: string; app_role?: string },
): boolean => {
  if (!token) {
    return false;
  }

  const idp = token.identity_provider;
  const appRole = token.app_role;
  const authRoute = `${idp}/${appRole}`;

  return (
    !pathname.includes(authRoute) &&
    !isUnauthenticatedAllowListedPath(pathname) &&
    !isAuthenticatedAllowListedPath(pathname)
  );
};

// Middleware for authorization
export const withAuthorization: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;
    // Check if the path is in the unauthenticated allow list
    if (isUnauthenticatedAllowListedPath(pathname)) {
      return next(request, _next);
    }
    // Check if the user is authenticated via the jwt encoded in server side cookie
    const token = await getToken();
    if (token) {
      // Redirect root requests to the dashboard
      if (pathname.endsWith("/reporting")) {
        return NextResponse.redirect(
          new URL(`/reporting/dashboard`, request.url),
        );
      }

      // Check if the path is in the authenticated allow list
      if (isAuthenticatedAllowListedPath(pathname)) {
        return next(request, _next);
      }

      // Check if the path requires authorization
      if (isAuthorizationRequiredPath(pathname, token)) {
        //rewrite the request to reflected the token permissions
        request.nextUrl.pathname = `${token.identity_provider}/${
          token.app_role
        }${pathname.replace("reporting/", "")}`;

        return NextResponse.rewrite(request.nextUrl);
      }

      // Routes with the folder structure break the breadcrumbs
      const pageSegment = pathname.replace(
        `/${token.identity_provider}/${token.app_role}`,
        "",
      );

      return NextResponse.redirect(new URL(`${pageSegment}`, request.url));
    } else {
      // Handle unauthenticated requests
      if (pathname.endsWith("/home")) {
        return next(request, _next);
      } else {
        return NextResponse.redirect(new URL(`/home`, request.url));
      }
    }
  };
};
