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
Checks for a valid user token to continue to next middleware else redirects to onboarding
 */

// Middleware for authorization
export const withAuthorization: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    // Check if the user is authenticated via the jwt encoded in server side cookie
    const token = await getToken();
    if (token) {
      // 🛸 Route to next middleware
      return next(request, _next);
    } else {
      // 🛸 Redirect unauthenticated requests
      return NextResponse.redirect(new URL(`/onboarding`, request.url));
    }
  };
};
