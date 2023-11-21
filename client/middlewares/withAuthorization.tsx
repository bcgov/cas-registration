import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { MiddlewareFactory } from "./types";
import { getToken } from "next-auth/jwt";

const isUnauthenticatedAllowListedPath = (pathname: string): boolean => {
  const authList = ["auth", "unauth"];
  return authList.some((path) => pathname.includes(path));
};

const isAuthenticatedAllowListedPath = (pathname: string): boolean => {
  const allowList = ["dashboard", "problem", "profile"];
  const lastSegment = pathname.split("/").pop();
  return allowList.includes(lastSegment || "");
};

const isAuthorizationRequiredPath = (
  pathname: string,
  token: { identity_provider?: string; app_role?: string },
): boolean => {
  if (!token) {
    return false;
  }

  const idp = token.identity_provider;
  const app_role = token.app_role;
  const authRoute = `${idp}/${app_role}`;

  return (
    !pathname.includes(authRoute) &&
    !pathname.endsWith(`/home`) &&
    !isUnauthenticatedAllowListedPath(pathname) &&
    !isAuthenticatedAllowListedPath(pathname)
  );
};

export const withAuthorization: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (isUnauthenticatedAllowListedPath(pathname)) {
      return next(request, _next);
    }

    if (token) {
      if (pathname.endsWith("/") || pathname.endsWith("/home")) {
        return NextResponse.redirect(new URL(`/dashboard`, request.url));
      }

      if (isAuthenticatedAllowListedPath(pathname)) {
        return next(request, _next);
      }

      if (isAuthorizationRequiredPath(pathname, token)) {
        request.nextUrl.pathname = `${token.identity_provider}/${token.app_role}${pathname}`;
        return NextResponse.rewrite(request.nextUrl);
      }

      const pageSegment = pathname.replace(
        `/${token.identity_provider}/${token.app_role}`,
        "",
      );

      return NextResponse.redirect(new URL(`${pageSegment}`, request.url));
    } else {
      if (pathname.endsWith("/home")) {
        return next(request, _next);
      } else {
        return NextResponse.redirect(new URL(`/home`, request.url));
      }
    }
  };
};
