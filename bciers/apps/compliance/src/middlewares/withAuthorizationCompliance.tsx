import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
/*
Access control logic is managed using Next.js middleware and NextAuth.js authentication JWT token.
The middleware intercepts requests, and for restricted areas...
Checks for a valid user session, and extracts user information from the JWT token.
Based on JWT properties of identity_provider and role, the middleware dynamically rewrites the request URL
to the appropriate folder structure.
 */

// Middleware for authorization
export const withAuthorizationCompliance: MiddlewareFactory = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextMiddleware,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;
    // Check if the user is authenticated via the jwt encoded in server side cookie
    const token = await getToken();

    if (token) {
      // build rewrite to physical folder path which enforces authorization by IdP and role
      request.nextUrl.pathname = `${token.identity_provider}/${
        token.app_role
      }${pathname.replace("compliance/", "")}`;
      return NextResponse.rewrite(request.nextUrl);
    } else {
      // Handle unauthenticated requests
      return NextResponse.redirect(new URL(`/onboarding`, request.url));
    }
  };
};
