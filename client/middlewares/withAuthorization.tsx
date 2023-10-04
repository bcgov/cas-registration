//import { getToken } from "next-auth/jwt";
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

    // 🔍 Check user auth token
    //*******************TEMP - TO DO - auth provider token access*************************
    // use mock auth via cookie
    const cookieName = "mock-auth-token";
    let token = request.cookies.get(cookieName)?.value;

    if (token) {
      //👌 ok: route to next middleware
      return next(request, _next);
    } else {
      // 👇️ check if signin or authentication route
      if (
        pathname.indexOf("/auth/signin") > -1 ||
        pathname.endsWith("/authenticate")
      ) {
        //👌 ok: route to next middleware
        return next(request, _next);
      }
      // ⛔️  UNAUTH'D: redirect to signin
      return NextResponse.redirect(new URL(`/auth/signin`, request.url));
    }
  };
};
