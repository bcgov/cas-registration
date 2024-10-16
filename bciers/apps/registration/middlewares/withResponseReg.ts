import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";

/*
Middleware to route to request app router path if pathname is in the allowed list;
otherwise,builds app router path based on JWT properties of identity_provider and role, the middleware dynamically rewrites the request URL
to the appropriate folder structure.
 */

const appName = "registration";

// Middleware for admin rules
export const withResponseReg: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;
    if (pathname.endsWith(`/`)) {
      // 🛸 Proceed to dashboard
      return NextResponse.next();
    }

    const token = await getToken();
    // 🧱 Build rewrite to physcial folder path which enforces authorization by IdP and role
    request.nextUrl.pathname = `${token.identity_provider}/${
      token.app_role
    }${pathname.replace(`${appName}/`, "")}`;

    // 🛸 Rewrite to the authorized app router path
    return NextResponse.rewrite(request.nextUrl);
  };
};
