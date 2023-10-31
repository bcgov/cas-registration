import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { MiddlewareFactory } from "./types";

export const withAuthorization: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    // 👇️ vars for route management
    const { pathname } = request.nextUrl;

    /******************TODO***********************
     *
     * AUTHENTICATION
     */

    // 🔍 Check user auth token
    // use mock auth via cookie
    const cookieName = "mock-auth-token";
    let token = request.cookies.get(cookieName)?.value;

    if (token) {
      //👌 ok: route to next middleware
      return next(request, _next);
    } else {
      // 👇️ check if signin or authentication route
      if (pathname.indexOf("/signin") > -1) {
        //👌 ok: route to next middleware
        return next(request, _next);
      }
      // ⛔️  UNAUTH'D: redirect to signin
      // return NextResponse.redirect(new URL(`/signin`, request.url));
      //TODO...for now, route baseUrl to {onboarding)/home}
      if (pathname.endsWith("/")) {
        //route to (onboarding)\home
        return NextResponse.redirect(new URL(`/home`, request.url));
      }
      //👌 ok: route to next middleware
      return next(request, _next);
    }
  };
};
