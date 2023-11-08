import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { MiddlewareFactory } from "./types";
import { getToken } from "next-auth/jwt";

export const withAuthorization: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    // 👇️ vars for route management
    const { pathname } = request.nextUrl;
    const isRouteAuth =
      pathname.indexOf("/auth") > -1 || pathname.indexOf("/unauth") > -1;

    // 👇️ check if authentication route
    if (isRouteAuth === true) {
      //👌 ok: route to next middleware
      return next(request, _next);
    }
    // 👇️ check for auth token: /api/auth/session
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) {
<<<<<<< HEAD
<<<<<<< HEAD
      // 👉️ OK: authenticated user
      if (pathname.endsWith("/") || pathname.endsWith("/home")) {
        //route to (authenticated)/dashboard
=======
      if (pathname.endsWith("/") || pathname.endsWith("/home")) {
        //route to (authenticated)\dashboard
>>>>>>> 280d666 (🚧 nextauth with keycloak provider)
=======
      // 👉️ OK: authenticated user
      if (pathname.endsWith("/") || pathname.endsWith("/home")) {
        //route to (authenticated)/dashboard
>>>>>>> 42b636c (🚧 nextauth SSO)
        return NextResponse.redirect(new URL(`/dashboard`, request.url));
      } else {
        //👌 ok: route to next middleware
        return next(request, _next);
      }
    } else {
<<<<<<< HEAD
<<<<<<< HEAD
      //📛 ANONYMOUS
      // route to (onboarding)/home
      if (pathname.endsWith("/home")) {
        //👌 ok: route to next middleware
        return next(request, _next);
<<<<<<< HEAD
      }
      // route to (onboarding)\home
      return NextResponse.redirect(new URL(`/home`, request.url));
=======
      //📛 route to (onboarding)\home
=======
      //📛 ANONYMOUS
      // route to (onboarding)/home
>>>>>>> 42b636c (🚧 nextauth SSO)
      if (pathname.endsWith("/home")) {
        //👌 ok: route to next middleware
        return next(request, _next);
      } else {
        //route to (onboarding)\home
        return NextResponse.redirect(new URL(`/home`, request.url));
      }
>>>>>>> 280d666 (🚧 nextauth with keycloak provider)
=======
      }
      // route to (onboarding)\home
      return NextResponse.redirect(new URL(`/home`, request.url));
>>>>>>> 0fe7d50 (🦨 fix: code smell)
    }
  };
};
