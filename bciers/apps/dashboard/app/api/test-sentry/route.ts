import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/dashboard/auth";
import { getToken } from "next-auth/jwt";
import { shouldUseSecureCookies } from "@bciers/utils/src/environmentDetection";

type ErrorType = "value" | "promise";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const errorType = (searchParams.get("error_type") || "value") as ErrorType;

  // Set user context from session before capturing errors
  try {
    const session = await auth();
    if (session?.user) {
      Sentry.setUser({
        id: session.user.user_guid || undefined,
        email: session.user.email || undefined,
      });
    } else {
      // Try to get user from token as fallback
      const cookieName = shouldUseSecureCookies()
        ? "__Secure-authjs.session-token"
        : "authjs.session-token";
      const token = await getToken({
        req: request,
        secret: `${process.env.NEXTAUTH_SECRET}`,
        salt: cookieName,
        cookieName: cookieName,
      });
      if (token?.user_guid) {
        Sentry.setUser({
          id: token.user_guid as string,
        });
      } else {
        Sentry.setUser(null);
      }
    }
  } catch (sessionError) {
    // If we can't get session, clear user context
    Sentry.setUser(null);
  }

  try {
    switch (errorType) {
      case "value":
        throw new Error(
          "Test ValueError for Better Stack integration - Invalid value provided",
        );
      case "promise":
        // Unhandled promise rejection simulation
        Promise.reject(
          new Error("Test unhandled promise rejection for Better Stack"),
        );

      default:
        throw new Error(`Unknown error type: ${errorType}`);
    }
  } catch (error) {
    // Capture the error in Sentry
    Sentry.captureException(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        errorType,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "No error occurred" }, { status: 200 });
}
