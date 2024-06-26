import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { MiddlewareFactory } from "@bciers/middlewares/server";
import { auth } from "@/dashboard/auth";
/*
Access control logic is managed using Next.js middleware and NextAuth.js authentication JWT session.
The middleware intercepts requests, and for restricted areas...
Checks for a valid user session, and extracts user information from the JWT session.
Based on JWT properties of identity_provider and role, the middleware dynamically rewrites the request URL
to the appropriate folder structure.
 */

const onboarding = "onboarding";
const dashboard = "dashboard";
// Function to check if the path is in the unauthenticated allow list
const isUnauthenticatedAllowListedPath = (pathname: string): boolean => {
  const authList = ["auth", "unauth"];
  return authList.some((path) => pathname.includes(path));
};

// Function to check if the path is in the authenticated allow list
// const isAuthenticatedAllowListedPath = (pathname: string) => {
//   const allowList = [dashboard, "registration", "reporting"];
//
//   // Split the pathname into segments
//   const segments = pathname.split("/");
//
//   // Iterate through each segment
//   for (const segment of segments) {
//     // Check if any value in the allowList matches the current segment
//     if (allowList.includes(segment)) {
//       return true; // Return true if match found
//     }
//   }
//
//   return false; // Return false if no match found
// };

// Middleware for authorization
export const withAuthorization: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;

    // Check if the path is in the unauthenticated allow list
    if (isUnauthenticatedAllowListedPath(pathname)) {
      return next(request, _next);
    }
    // Check if the user is dashboard via the jwt encoded in server side cookie
    const session = await auth();

    if (session) {
      if (pathname === "/" || pathname.endsWith(`/${onboarding}`)) {
        return NextResponse.redirect(new URL(`/${dashboard}`, request.url));
      } else {
        return next(request, _next);
      }
    } else {
      // Handle unauthenticated requests
      if (pathname.endsWith(`/${onboarding}`)) {
        return next(request, _next);
      } else {
        return NextResponse.redirect(new URL(`/${onboarding}`, request.url));
      }
    }
  };
};
