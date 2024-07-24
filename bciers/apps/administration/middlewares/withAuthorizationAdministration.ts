import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { MiddlewareFactory } from "@bciers/middlewares";
import { IDP } from "@bciers/utils/enums";
import { getToken } from "@bciers/actions";

/*
Access control logic is managed using Next.js middleware and NextAuth.js authentication JWT token.
The middleware intercepts requests, and for restricted areas...
Checks for a valid user token, and extracts user information from the JWT token.
Based on JWT properties of identity_provider and role, the middleware dynamically rewrites the request URL
to the appropriate folder structure.
 */

// Function to check if the path is in the authenticated allow list- does not build authorization folders
const isAuthenticatedAllowListedPath = (pathname: string): boolean => {
  const allowList = ["profile"];
  const lastSegment = pathname.split("/").pop();
  return allowList.includes(lastSegment || "");
};

const isAuthorizedIdirUser = (token: {
  identity_provider?: string;
  app_role?: string;
}): boolean => {
  if (!token) {
    return false;
  }

  const idp = token.identity_provider;
  const appRole = token.app_role;
  return idp === IDP.IDIR && !appRole?.includes("pending") ? true : false;
};

// Middleware for authorization
export const withAuthorizationAdministration: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;

    // Check if the user is authenticated via the jwt encoded in server side cookie
    const token = await getToken();

    if (token) {
      // Check if the path is in the authenticated allow list
      if (isAuthenticatedAllowListedPath(pathname)) {
        return next(request, _next);
      }

      if (pathname.includes("operations")) {
        // Industry users are only allowed to see their operations if their operator is pending/approved
        if (!isAuthorizedIdirUser(token)) {
          try {
            const options: RequestInit = {
              cache: "no-store", // Default cache option
              method: "GET",
              headers: new Headers({
                Authorization: JSON.stringify({
                  user_guid: token.user_guid,
                }),
              }),
            };
            const response = await fetch(
              `${process.env.API_URL}registration/user-operators/current`,
              options,
            );
            const operator = await response.json();
            if (
              operator.status !== "Pending" &&
              operator.status !== "Approved"
            ) {
              return NextResponse.redirect(
                new URL(`/administration`, request.url),
              );
            }
          } catch (error) {
            throw error;
          }
        }
      }
      // build rewrite to physcial folder path which enforces authorization by IdP and role
      request.nextUrl.pathname = `${token.identity_provider}/${
        token.app_role
      }${pathname.replace("administration/", "")}`;

      return NextResponse.rewrite(request.nextUrl);
    } else {
      // Handle unauthenticated requests
      return NextResponse.redirect(new URL(`/onboarding`, request.url));
    }
  };
};
