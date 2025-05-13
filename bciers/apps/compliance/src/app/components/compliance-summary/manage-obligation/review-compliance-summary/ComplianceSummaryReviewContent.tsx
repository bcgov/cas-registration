"use client";
import { FormReport } from "./FormReport";
import { ComplianceHeading } from "../../ComplianceHeading";
import { ComplianceObligation } from "./ComplianceObligation";
import { ComplianceUnitsGrid } from "./ComplianceUnitsGrid";
import { MonetaryPaymentsGrid } from "./MonetaryPaymentsGrid";
import { OutstandingComplianceObligation } from "./OutstandingComplianceObligation";
import { AutomaticOverduePenalty } from "./AutomaticOverduePenalty";
import ComplianceStepButtons from "@bciers/components/form/components/ComplianceStepButtons";
import { useState } from "react";

interface Props {
  readonly continueUrl: string;
  readonly backUrl?: string;
  readonly data: any;
  readonly complianceSummaryId?: number;
}

export function ComplianceSummaryReviewContent(props: Props) {
  const { backUrl, continueUrl, data, complianceSummaryId } = props;
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const handleGenerateInvoice = async () => {
    if (!complianceSummaryId) {
      return;
    }

    try {
      setIsGeneratingInvoice(true);

      const invoiceUrl = `/compliance/api/invoice/${complianceSummaryId}`;

      window.open(invoiceUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error generating invoice:", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  return (
    <div className="w-full">
      <ComplianceHeading title="Report Information" />
      <FormReport data={data} />
      <ComplianceObligation data={data} />
      <ComplianceUnitsGrid
        data={""}
        complianceSummaryId={complianceSummaryId}
      />
      <MonetaryPaymentsGrid data={""} />
      <OutstandingComplianceObligation data={data} />
      <AutomaticOverduePenalty data={data} />

      <ComplianceStepButtons
        key="form-buttons"
        backUrl={backUrl}
        continueUrl={continueUrl}
        backButtonDisabled={false}
        middleButtonDisabled={isGeneratingInvoice}
        submitButtonDisabled={false}
        middleButtonText={
          isGeneratingInvoice
            ? "Generating Invoice..."
            : "Generate Compliance Invoice"
        }
        onMiddleButtonClick={handleGenerateInvoice}
      />
    </div>
  );
}
