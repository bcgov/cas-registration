import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { MiddlewareFactory } from "./types";
import { getToken } from "next-auth/jwt";

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
  const allowList = ["dashboard", "problem", "profile"];
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
    !pathname.endsWith(`/home`) &&
    !isUnauthenticatedAllowListedPath(pathname) &&
    !isAuthenticatedAllowListedPath(pathname)
  );
};

// Middleware for authorization
export const withAuthorization: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Check if the path is in the unauthenticated allow list
    if (isUnauthenticatedAllowListedPath(pathname)) {
      return next(request, _next);
    }
    // Check if the user is authenticated
    if (token) {
      // Redirect root or home requests to the dashboard
      if (pathname.endsWith("/") || pathname.endsWith("/home")) {
        return NextResponse.redirect(new URL(`/dashboard`, request.url));
      }

      // Check if the path is in the authenticated allow list
      if (isAuthenticatedAllowListedPath(pathname)) {
        return next(request, _next);
      }

      // Check if the path requires authorization
      if (isAuthorizationRequiredPath(pathname, token)) {
        request.nextUrl.pathname = `${token.identity_provider}/${token.app_role}${pathname}`;
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
