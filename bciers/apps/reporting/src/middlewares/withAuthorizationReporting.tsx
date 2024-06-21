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
Checks for a valid user token, and extracts user information from the JWT token.
Based on JWT properties of identity_provider and role, the middleware dynamically rewrites the request URL
to the appropriate folder structure.
 */

// Middleware for authorization
export const withAuthorizationReporting: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;
    // Check if the user is authenticated via the jwt encoded in server side cookie
    const token = await getToken();

    if (token) {
      // build rewrite to physcial folder path which enforces authorization by IdP and role
      request.nextUrl.pathname = `${token.identity_provider}/${
        token.app_role
      }${pathname.replace("reporting/", "")}`;
      return NextResponse.rewrite(request.nextUrl);
    } else {
      // Handle unauthenticated requests
      return NextResponse.redirect(new URL(`/dashboard`, request.url));
    }
  };
};
