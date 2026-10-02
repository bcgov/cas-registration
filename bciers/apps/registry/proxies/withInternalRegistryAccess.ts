import { getToken } from "@bciers/actions";
import { ProxyFactory } from "@bciers/proxies";
import { InternalFrontEndRoles } from "@bciers/utils/src/enums";
import {
  NextFetchEvent,
  NextProxy,
  NextRequest,
  NextResponse,
} from "next/server";

const allowedRoles = new Set<string>([
  InternalFrontEndRoles.CAS_ADMIN,
  InternalFrontEndRoles.CAS_ANALYST,
  InternalFrontEndRoles.CAS_DIRECTOR,
  InternalFrontEndRoles.CAS_VIEW_ONLY,
]);

export const withInternalRegistryAccess: ProxyFactory = (next: NextProxy) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const token = await getToken();

    if (!allowedRoles.has(token.app_role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return next(request, event);
  };
};
