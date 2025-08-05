import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import { appName } from "../middleware";
/*
Middleware to route to request app router path if pathname is in the allowed list;
otherwise,builds app router path based on JWT properties of identity_provider and role, the middleware dynamically rewrites the request URL
to the appropriate folder structure.
 */

// Function to check if the path is in the authenticated allow list- does not build authorization folders
const isAuthenticatedAllowListedPath = (pathname: string): boolean => {
  const allowList = ["profile"];
  const lastSegment = pathname.split("/").pop();
  return allowList.includes(lastSegment || "");
};

// Middleware for admin rules
export const withResponseAdmin: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;
    // Check if the path is in the authenticated allow list
    if (isAuthenticatedAllowListedPath(pathname)) {
      // 🛸 Route to the app router path
      return next(request, _next);
    }
    const token = await getToken();

    // 🧱 Build rewrite to physical folder path which enforces authorization by IdP and role
    request.nextUrl.pathname = `${token.identity_provider}/${
      token.app_role
    }${pathname.replace(`${appName}/`, "")}`;

    // 🛸 Rewrite to the authorized app router path
    return NextResponse.rewrite(request.nextUrl);
  };
};
