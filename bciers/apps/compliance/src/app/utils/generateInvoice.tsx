"use client";

export enum InvoiceType {
  AUTOMATIC_OVERDUE_PENALTY = "automatic-overdue-penalty",
  OBLIGATION = "obligation",
}

const generateInvoice = async (
  complianceReportVersionId: number,
  invoiceType: InvoiceType,
) => {
  const res = await fetch(
    `/compliance/api/invoice/${complianceReportVersionId}/${invoiceType}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
  const contentType = res.headers.get("Content-Type") || "";

  // Handle error or JSON payload
  if (contentType.includes("application/json")) {
    let payload: any = { message: `Failed with status ${res.status}` };

    try {
      payload = await res.json();
    } catch {
      // ignore invalid JSON
    }

    if (typeof payload.message === "string") {
      throw new Error(
        payload.message ||
          `Failed to generate penalty invoice (status ${res.status})`,
      );
    }

    return;
  }

  // Handle non-JSON response errors
  if (!res.ok) {
    throw new Error(
      `Failed to generate penalty invoice (status ${res.status})`,
    );
  }

  // Handle PDF response
  const pdfBlob = await res.blob();
  const objectUrl = URL.createObjectURL(pdfBlob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");

  // Cleanup
  setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
};

export default generateInvoice;
