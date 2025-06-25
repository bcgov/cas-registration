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
   * - Calls the app API route `/compliance/api/invoice/{complianceSummaryId}`.
   * - If the response is a 4xx/5xx with a JSON payload containing `errors`,
   *   extracts the first error message and stores it in state for display.
   * - If the response is successful (PDF stream), converts it to a Blob,
   *   creates an object URL, and opens it in a new tab.
   */
  const handleGenerateInvoice = async () => {
    setErrors([]);
    setIsGeneratingInvoice(true);

    try {
      const res = await fetch(
        `/compliance/api/invoice/${complianceSummaryId}`,
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
          setErrors([payload.message]);
          return;
        }

        // Generic fallback message
        setErrors([`Failed to generate invoice (status ${res.status})`]);
        return;
      }

      // Handle non-JSON response errors
      if (!res.ok) {
        setErrors([`Failed to generate invoice (status ${res.status})`]);
        return;
      }

      // Handle PDF response
      const pdfBlob = await res.blob();
      const objectUrl = URL.createObjectURL(pdfBlob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrors([msg]);
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
