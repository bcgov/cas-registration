import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { MiddlewareFactory } from "./types";

// 👇️ return request's response
export const withResponse: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const cookieName = "mock-auth-token";
    const { pathname } = request.nextUrl;

    // 👇️ create response
    let response = NextResponse.next();

    // 🔍 Check mock authentication
    if (pathname.endsWith("/authenticate")) {
      // redirect to auth path
      response = NextResponse.redirect(new URL(`/auth`, request.url));
      // 🍪 set cookie to response to fake auth cookie for next request
      response.cookies.set(cookieName, "mock-authenticated");
    }

    if (pathname.endsWith("/signout")) {
      // 🍪 delete cookie from response
      response.cookies.delete(cookieName);
    }

    return response;
  };
};
