"use server";

import { getToken } from "@bciers/actions";
import * as Sentry from "@sentry/nextjs";

interface DownloadResult {
  success: boolean;
  data?: {
    base64Data: string;
    filename: string;
    contentType: string;
  };
  error?: string;
}

/**
 * Server action to download a PDF invoice for a compliance summary
 *
 * @param complianceSummaryId - The ID of the compliance summary
 * @returns An object containing the base64 encoded PDF data and filename
 */
export async function downloadInvoice(
  complianceSummaryId: number,
): Promise<DownloadResult> {
  return Sentry.withServerActionInstrumentation(
    `Download Invoice for compliance summary ID: ${complianceSummaryId}`,
    {},
    async () => {
      try {
        const token = await getToken();

        const apiUrl = process.env.API_URL;

        if (!apiUrl) {
          throw new Error("API_URL environment variable is not set");
        }

        const headers = new Headers({
          Accept: "application/pdf",
          Authorization: JSON.stringify({
            user_guid: token?.user_guid || "",
          }),
        });

        const url = `${apiUrl}compliance/invoice/generate/${complianceSummaryId}`;

        const response = await fetch(url, {
          method: "GET",
          headers,
          cache: "no-store",
        });

        if (!response.ok) {
          console.error(`API Error: HTTP status ${response.status}`);
          throw new Error(
            `Failed to generate invoice: HTTP status ${response.status}`,
          );
        }

        const pdfData = await response.arrayBuffer();

        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = "invoice.pdf";
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        const base64Data = Buffer.from(pdfData).toString("base64");

        return {
          success: true,
          data: {
            base64Data,
            filename,
            contentType: "application/pdf",
          },
        };
      } catch (error) {
        Sentry.captureException(error);

        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
  );
}
