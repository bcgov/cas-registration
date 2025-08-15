import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@bciers/actions";
import * as Sentry from "@sentry/nextjs";

/**
 * API route handler for downloading invoice PDFs directly.
   Calls the endpoint `/compliance/api/{complianceReportVersionId}/invoice/pdf`.
 * Also handles JSON‐encoded errors returned by the service.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; invoiceType: string } },
) {
  const { id, invoiceType } = params;

  try {
    // Build API URL and headers
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
      throw new Error("API_URL environment variable is not set");
    }
    let url;

    switch (invoiceType) {
      case "obligation":
        url = `${apiUrl}compliance/compliance-report-versions/${id}/invoice/pdf`;
        break;
      case "automatic-overdue-penalty":
        url = `${apiUrl}compliance/compliance-report-versions/${id}/automatic-overdue-penalty/invoice/pdf`;
        break;
      default:
        throw new Error(`Invalid invoice type: ${invoiceType}`);
    }

    // Obtain user token
    const token = await getToken();
    const userGuid = token?.user_guid ?? "";

    const requestHeaders = new Headers({
      Accept: "application/pdf, application/json",
      Authorization: JSON.stringify({ user_guid: userGuid }),
    });

    // Fetch from backend service
    const response = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
    });

    const contentType = response.headers.get("Content-Type") ?? "";
    const isJson = contentType.includes("application/json");

    if (isJson) {
      // Parse JSON error or payload
      const jsonBody = await response.json();
      const statusCode = response.ok ? 400 : response.status;
      return NextResponse.json(jsonBody, { status: statusCode });
    }

    // Otherwise, assume PDF stream
    const dispositionHeader = response.headers.get("Content-Disposition") ?? "";
    const filenameMatch = /filename="(.+)"/i.exec(dispositionHeader);
    const filename = filenameMatch?.[1] || "invoice.pdf";

    const responseHeaders = new Headers({
      "Content-Type": contentType || "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    });

    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err) {
    Sentry.captureException(err);
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
