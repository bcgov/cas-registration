// eslint-disable-next-line
import { MiddlewareFactory } from '@/middlewares/types';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const authenticatedRoutes = ['/authenticated'];

// Middleware for reporting authorization
// This is meant to be throwaway code until we refactor the middleware in the registration app to be configurable
export const withReportingAuthorization: MiddlewareFactory = (next) => {
  return async (request, _next) => {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = request.nextUrl;

    if (token) {
      if (authenticatedRoutes.some((route) => pathname.endsWith(route))) {
        return next(request, _next);
      }
      return NextResponse.redirect(
        new URL(authenticatedRoutes[0], request.url),
      );
    }

    if (pathname === '/') {
      return next(request, _next);
    }
    return NextResponse.redirect(new URL('/', request.url));
  };
};
