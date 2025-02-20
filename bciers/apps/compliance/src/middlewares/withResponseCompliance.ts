import { NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { getToken } from "@bciers/actions";
import { appName } from "../middleware";

export const withResponseCompliance: MiddlewareFactory = () => {
  return async (request: NextRequest) => {
    const { pathname } = request.nextUrl;
    if (pathname.endsWith(`/`)) {
      return NextResponse.next();
    }

    const token = await getToken();
    // Build rewrite to physical folder path which enforces authorization by IdP and role
    request.nextUrl.pathname = `${token.identity_provider}/${
      token.app_role
    }${pathname.replace(`${appName}/`, "")}`;

    return NextResponse.rewrite(request.nextUrl);
  };
};
