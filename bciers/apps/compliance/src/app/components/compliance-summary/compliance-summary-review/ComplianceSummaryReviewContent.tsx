"use-client";
import { FormReport } from "./FormReport";
import { ComplianceHeading } from "../ComplianceHeading";
import { ComplianceObligation } from "./ComplianceObligation";
import { ComplianceUnitsGrid } from "./ComplianceUnitsGrid";
import { MonetaryPaymentsGrid } from "./MonetaryPaymentsGrid";
import { OutstandingComplianceObligation } from "./OutstandingComplianceObligation";
import { AutomaticOverduePenalty } from "./AutomaticOverduePenalty";
import ComplianceStepButtons from "@bciers/components/form/components/ComplianceStepButtons";
import { downloadInvoice } from "../../../actions/downloadInvoice";
import { useState } from "react";

interface Props {
  continueUrl: string;
  backUrl?: string;
  data: any;
  complianceSummaryId?: number;
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

      const result = await downloadInvoice(complianceSummaryId);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Error generating invoice");
      }

      const { base64Data, contentType } = result.data;

      const byteArray = Uint8Array.from(atob(base64Data), (c) =>
        c.charCodeAt(0),
      );
      const blob = new Blob([byteArray], { type: contentType });

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);
    } catch (error) {
      throw new Error(error as string);
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
