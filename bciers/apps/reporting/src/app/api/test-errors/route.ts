/**
 * Test API route for server-side error tracking (Raygun).
 *
 * This endpoint allows testing server-side error reporting in Next.js API routes.
 */
import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - raygun.ts is at project root, not in tsconfig paths
import { sendToRaygun } from "../../../../../../raygun";

export async function GET(request: NextRequest) {
  const errorType =
    request.nextUrl.searchParams.get("error_type") || "runtime_error";

  try {
    // Raise different types of errors based on query parameter
    switch (errorType) {
      case "runtime_error":
        throw new Error("Test RuntimeError for server-side Raygun POC");
      case "value_error":
        throw new Error("Test Error for server-side Raygun POC");
      case "type_error": {
        // Intentionally accessing null as object to trigger TypeError
        const nullObj: any = null;
        nullObj.someMethod();
        break;
      }
      default:
        throw new Error(`Unknown error type: ${errorType}`);
    }
  } catch (error) {
    // Send to Raygun if available
    if (error instanceof Error) {
      sendToRaygun(
        error,
        {
          app: "reporting",
          errorType,
          path: request.nextUrl.pathname,
        },
        ["test", "server-side", "api-route"],
      );
    }

    // Return error response
    return NextResponse.json(
      {
        message: "Test server-side error sent to Raygun",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "This should not be reached" },
    { status: 500 },
  );
}
