import { NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import { appName } from "../proxy";

export const withResponseCompliance: MiddlewareFactory = () => {
  return async (request: NextRequest) => {
    const { pathname } = request.nextUrl;
    if (pathname.endsWith(`/`)) {
      // 🛸 Proceed to dashboard
      return NextResponse.next();
    }

    const token = await getToken();
    // 🧱 Build rewrite to physical folder path which enforces authorization by IdP and role
    const re = new RegExp(`^/${appName}(?=/|$)`);
    const stripped = pathname.replace(re, "") || "/";

    request.nextUrl.pathname = `/${token.identity_provider}/${token.app_role}${
      stripped.startsWith("/") ? "" : "/"
    }${stripped}`;

    return NextResponse.rewrite(request.nextUrl);
  };
};
