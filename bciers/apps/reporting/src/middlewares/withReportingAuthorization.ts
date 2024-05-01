// eslint-disable-next-line
import { MiddlewareFactory } from "@/middlewares/types";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const isNextAuthPath = (path: string) => {
  return path.startsWith("/api/auth/");
};
const authenticatedRoot = "/authenticated";
const isAuthenticatedPath = (path: string) => {
  return path.startsWith(authenticatedRoot);
};

// Middleware for reporting authorization
// This is meant to be throwaway code until we refactor the middleware in the registration app to be configurable
export const withReportingAuthorization: MiddlewareFactory = (next) => {
  return async (request, _next) => {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = request.nextUrl;

    // Next-auth routes need to be allowed through
    if (isNextAuthPath(pathname)) {
      return next(request, _next);
    }

    // If we have a valid token we redirect to the authenticated root
    if (token && token.sub) {
      if (isAuthenticatedPath(pathname)) {
        return next(request, _next);
      }
      return NextResponse.redirect(new URL(authenticatedRoot, request.url));
    }

    // If we don't have a valid token we redirect to "/"
    if (pathname === "/") {
      return next(request, _next);
    }
    return NextResponse.redirect(new URL("/", request.url));
  };
};
