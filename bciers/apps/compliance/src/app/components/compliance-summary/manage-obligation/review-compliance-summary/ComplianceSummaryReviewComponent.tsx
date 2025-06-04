"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { useState } from "react";
import {
  complianceSummaryReviewUiSchema,
  createComplianceSummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/complianceSummaryReviewSchema";
import { FormBase } from "@bciers/components/form";
import FormAlerts from "@bciers/components/form/FormAlerts";

interface Props {
  readonly data: any;
  readonly complianceSummaryId: string;
}

export function ComplianceSummaryReviewComponent({
  data,
  complianceSummaryId,
}: Readonly<Props>) {
  const [errors, setErrors] = useState<string[]>([]);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const backUrl = "/compliance-summaries";
  const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}/download-payment-instructions`;

  /**
   * Attempts to fetch and open a compliance invoice PDF in a new window.
   * - Calls the API endpoint `/compliance/api/invoice/{complianceSummaryId}`.
   * - If the response is a 4xx/5xx with a JSON payload containing `errors`,
   *   extracts the first error message and stores it in state for display.
   * - If the response is successful (PDF stream), converts it to a Blob,
   *   creates an object URL, and opens it in a new tab.
   */
  const handleGenerateInvoice = async () => {
    setErrors([]);
    setIsGeneratingInvoice(true);

    try {
      // Call our Next.js API endpoint
      const res = await fetch(
        `/compliance/api/invoice/${complianceSummaryId}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      // If the API returned a non-OK status, attempt to parse JSON and look for “errors”
      if (!res.ok) {
        let payload: any = { error: `Failed with status ${res.status}` };
        try {
          payload = await res.json();
        } catch {
          // ignore JSON parse errors
        }

        // If the payload has an .errors object, extract its first value
        if (payload.errors && typeof payload.errors === "object") {
          const firstErrorKey = Object.keys(payload.errors)[0];
          const rawErrorMsg = payload.errors[firstErrorKey];
          setErrors([rawErrorMsg]);
        } else {
          // Fallback: use payload.error or generic message
          const rawError =
            payload.error ||
            `Failed to generate invoice (status ${res.status})`;
          setErrors([rawError]);
        }

        return;
      }

      // Convert to Blob and open in a new tab
      const pdfBlob = await res.blob();
      const objectUrl = URL.createObjectURL(pdfBlob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");

      // Revoke the object URL after a short delay
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 30_000);
    } catch (err) {
      // Display error to the user
      const message = err instanceof Error ? err.message : String(err);
      setErrors([message]);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  return (
    <FormBase
      schema={createComplianceSummaryReviewSchema(data.reportingYear)}
      uiSchema={complianceSummaryReviewUiSchema}
      formData={data}
      className="w-full"
    >
      <ComplianceStepButtons
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        middleButtonDisabled={isGeneratingInvoice}
        middleButtonText={
          isGeneratingInvoice
            ? "Generating Invoice..."
            : "Generate Compliance Invoice"
        }
        onMiddleButtonClick={handleGenerateInvoice}
      />

      {/* Render any errors */}
      <FormAlerts key="alerts" errors={errors} />
    </FormBase>
  );
}
