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

    //...for now, route baseUrl to {onboarding)/home}
    if (pathname.endsWith("/")) {
      //route to (onboarding)\home
      return NextResponse.redirect(new URL(`/home`, request.url));
    }
    //👌 ok: route to next middleware
    return next(request, _next);
  };
};
