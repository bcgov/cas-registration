import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@bciers/actions";
import * as Sentry from "@sentry/nextjs";

/**
 * API route handler for downloading invoice PDFs directly
 *
 * @param request - The incoming request
 * @param params - The route parameters, including the compliance summary ID
 * @returns A response with the PDF data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = params.id;

  try {
    const token = await getToken();

    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
      throw new Error("API_URL environment variable is not set");
    }

    const requestHeaders = new Headers({
      Accept: "application/pdf",
      Authorization: JSON.stringify({
        user_guid: token?.user_guid ?? "",
      }),
    });

    const url = `${apiUrl}compliance/compliance-report-versions/${id}/invoice`;

    const response = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`API Error: HTTP status ${response.status}`);
      return NextResponse.json(
        { error: `Failed to generate invoice: HTTP status ${response.status}` },
        { status: response.status },
      );
    }

    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "invoice.pdf";
    if (contentDisposition) {
      const filenameRegex = /filename="(.+)"/i;
      const filenameMatch = filenameRegex.exec(contentDisposition);
      filename = filenameMatch?.[1] ?? filename;
    }

    const responseHeaders = new Headers({
      "Content-Type": response.headers.get("Content-Type") ?? "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    });

    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    const pdfResponse = new NextResponse(response.body, {
      status: 200,
      headers: responseHeaders,
    });

    return pdfResponse;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error downloading invoice:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    );
  }
}
