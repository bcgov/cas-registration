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
    // 🧩 For route management
    const { pathname } = request.nextUrl;

    // 🔑 Define an unauthenticated allow list
    const authList = ["auth", "unauth"];
    // Check if the pathname includes any path from the auth list
    const isAuth = authList.some((path) => pathname.includes(path));
    if (isAuth) {
      //👌 ok: route to path
      return NextResponse.next();
    } else {
      // 🔍 check for NextAuth token
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (token) {
        // 🔒 AUTHENTICATION REQUIRED ROUTES
        // 👇️ Redirect root or home requests to dashboard
        if (pathname.endsWith("/") || pathname.endsWith("/home")) {
          // 🛸 Return a redirect to the authenticated dashboard "page" route
          return NextResponse.redirect(new URL(`/dashboard`, request.url));
        }
        // 🔑 Define an authenticated allow list
        const allowList = ["dashboard", "problem", "profile"];
        // Split the pathname by "/"
        const segments = pathname.split("/");
        // Get the last segment
        const lastSegment = segments[segments.length - 1];
        // Check if the last segment is in the allow list
        const isAllowed = allowList.includes(lastSegment);

        if (isAllowed) {
          //👌 ok: route to path
          return NextResponse.next();
        } else {
          // 🔒 AUTHORIZATION REQUIRED ROUTES
          /* 📚  Protected Routes
          initial route should reflect a "page" route
          for app security this "page" route will be augment with the NextAuth user's idp and role
          and reflect the folder structure of app\idp\role\*page*
          NOTES:
          app url will reflect the "page" route and regression "pathname code" will work as expected
          if the folder structure of app\idp\role\*page* does not exist a "not authorized" default page will display
          */
          // 👇️ Define the authorization routes based on identity provider and role
          const idp = token.identity_provider;
          const role = token.role;
          const authRoute = `${idp}/${role}`;
          if (!pathname.includes(authRoute)) {
            // 🔒 Set the route to protected app folder structure based idp/role
            request.nextUrl.pathname = `${authRoute}${pathname}`;
            // 🧹 Rewrite the route so to redirect to protected route without reflecting change in the app url
            return NextResponse.rewrite(request.nextUrl);
          } else {
            // ❗ Routes with the folder structure break the breadcrumbs; so...
            // 🛸 Return a redirect to the "page" route w/o the folder structure
            const pageSegment = pathname.replace(authRoute, "");
            return NextResponse.redirect(
              new URL(`/${pageSegment}`, request.url)
            );
          }
        }
      } else {
        //📛 ANONYMOUS
        // route to (onboarding)/home
        if (pathname.endsWith("/home")) {
          //👌 OK: return request
          return NextResponse.next();
        } else {
          // 🛸 Return a redirect to (onboarding)\home
          return NextResponse.redirect(new URL(`/home`, request.url));
        }
      }
    }
  };
};
