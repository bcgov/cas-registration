import {
  NextFetchEvent,
  NextProxy,
  NextRequest,
  NextResponse,
} from "next/server";

import { DashboardRoutes, ProxyFactory } from "@bciers/proxies";
import { getToken } from "@bciers/actions";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import isInAllowedPath from "@bciers/utils/src/isInAllowedList";
import { isUserArchived } from "@bciers/actions/api";

export const authAllowedPaths = [
  DashboardRoutes.DASHBOARD,
  DashboardRoutes.PROFILE,
];

const unauthAllowedPaths = [
  DashboardRoutes.AUTH,
  DashboardRoutes.UNAUTH,
  DashboardRoutes.DECLINED,
  DashboardRoutes.ERROR,
];

// Proxy for authorization
export const withAuthorizationDashboard: ProxyFactory = (next: NextProxy) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;

    // Check if the path is in the unauthenticated allow list
    if (isInAllowedPath(pathname, unauthAllowedPaths)) {
      return next(request, _next);
    }

    try {
      const token = await getToken();

      // Handle unauthenticated users
      if (!token) {
        if (pathname.endsWith(DashboardRoutes.ONBOARDING)) {
          return next(request, _next);
        }
        return NextResponse.redirect(
          new URL(DashboardRoutes.ONBOARDING, request.url),
        );
      }

      //  Handle user is archived
      const archived = await isUserArchived();
      if (archived) {
        return NextResponse.redirect(
          new URL(DashboardRoutes.DECLINED, request.url),
        );
      }

      // Handle user without token.app_role
      if (!token.app_role) {
        if (pathname.endsWith(DashboardRoutes.PROFILE)) {
          return next(request, _next);
        }
        return NextResponse.redirect(
          new URL(DashboardRoutes.PROFILE, request.url),
        );
      }

      // Handle user with token.app_role = cas_pending
      if (token.app_role === FrontEndRoles.CAS_PENDING) {
        if (isInAllowedPath(pathname, authAllowedPaths)) {
          return next(request, _next);
        }
        return NextResponse.redirect(
          new URL(DashboardRoutes.DASHBOARD, request.url),
        );
      }

      // Handle root and onboarding routes for authenticated users
      if (pathname === "/" || pathname === DashboardRoutes.ONBOARDING) {
        return NextResponse.redirect(
          new URL(DashboardRoutes.DASHBOARD, request.url),
        );
      }

      return next(request, _next);
    } catch (_error) {
      return NextResponse.redirect(new URL(DashboardRoutes.ERROR, request.url));
    }
  };
};
