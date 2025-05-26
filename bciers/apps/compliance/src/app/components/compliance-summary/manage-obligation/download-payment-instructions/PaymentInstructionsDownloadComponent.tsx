"use client";

import ComplianceHeading from "../../ComplianceHeading";
import ComplianceSummaryTaskList from "@bciers/components/navigation/complianceSummaryTaskList/ComplianceSummaryTaskList";
import ComplianceStepButtons from "@bciers/components/form/components/ComplianceStepButtons";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { TitleRow } from "../../TitleRow";
import { InfoRow } from "../../InfoRow";
import { useState } from "react";

interface Props {
  readonly taskListElements: TaskListElement[];
}

function PayeeInformation() {
  return (
    <div className="w-full mb-8">
      <InfoRow label={"Invoice #:"} value={"invoiceNumber"} classNames="mb-8" />
      <TitleRow label={"Payee Information"} />
      <InfoRow label={"Name of Bank:"} value={"bankName"} />
      <InfoRow label={"Bank Transit Number:"} value={"transitNumber"} />
      <InfoRow label={"Institution Number:"} value={"institutionNumber"} />
      <InfoRow label={"Swift Code:"} value={"swiftCode"} />
      <InfoRow label={"Account Number:"} value={"accountNumber"} />
      <InfoRow label={"Account Name:"} value={"accountName"} />
      <InfoRow label={"Bank Address:"} value={"bankAddress"} />
    </div>
  );
}

function PaymentInstructionsDetails() {
  return (
    <div className="w-full mb-8">
      <TitleRow label={"Payment Instructions"} />
      <h3>Before making a payment</h3>
      <p>
        Send an email notification to{" "}
        <a href="mailto:OBPSPayments@gov.bc.ca">OBPSPayments@gov.bc.ca</a>{" "}
        before sending payment
      </p>
      <p>Include:</p>
      <ul>
        <li>Operator Name</li>
        <li>Exact payment date</li>
        <li>Payment amount</li>
        <li>Invoice number</li>
      </ul>
      <h3>Pay by electronic fund transfer (EFT)</h3>
      <ul>
        <li>Include the invoice number as a reference</li>
        <li>
          Pay at least five business days before the due date to allow for
          processing time
        </li>
      </ul>
      <h3>Pay by wire transfer</h3>
      <p>Include the invoice number as a reference</p>
      <h3>Provide correct information for timely processing</h3>
      <p>
        Failure to provide accurate payment information will result in delays in
        payment processing and possible interest and/or penalty charges.
      </p>
      <p>
        Contact{" "}
        <a href="mailto:OBPSPayments@gov.bc.ca">OBPSPayments@gov.bc.ca</a> for
        any questions.
      </p>
    </div>
  );
}

function PaymentRemarks() {
  return (
    <div className="w-full">
      <TitleRow label={"Remarks"} />
      <ul>
        <li>
          Pay by the due date to avoid <a>penalties</a> and/or <a>interests</a>
        </li>
        <li>Do not include other charges with your payment for this invoice</li>
        <li>Do not mail cash</li>
      </ul>
    </div>
  );
}

function PaymentInstructions() {
  return (
    <div className="w-full">
      <ComplianceHeading title="Download Payment Instructions" />
      <PayeeInformation />
      <PaymentInstructionsDetails />
      <PaymentRemarks />
    </div>
  );
}

export default function PaymentInstructionsDownloadComponent({
  taskListElements,
}: Props) {
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const handleDownloadInstructions = async () => {
    const complianceSummaryId = "OBI000004";
    if (!complianceSummaryId) {
      return;
    }

    try {
      setIsGeneratingDownload(true);

      const instructionsUrl = `/compliance/api/payment-instructions/${complianceSummaryId}`;

      window.open(instructionsUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error generating payment instructions:", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsGeneratingDownload(false);
    }
  };
  return (
    <div>
      <div className="container mx-auto p-4" data-testid="compliance-review">
        <h2 className="text-2xl font-bold mb-4 text-bc-bg-blue">
          Pink Operation
        </h2>
      </div>
      <div className="w-full flex">
        <div className="hidden md:block">
          <ComplianceSummaryTaskList elements={taskListElements} />
        </div>
        <PaymentInstructions />
      </div>
      <ComplianceStepButtons
        key="form-buttons"
        backUrl={"test"}
        continueUrl={"test"}
        backButtonDisabled={false}
        middleButtonDisabled={isGeneratingDownload}
        submitButtonDisabled={false}
        middleButtonText={"Download Payment Information"}
        onMiddleButtonClick={handleDownloadInstructions}
      />
    </div>
  );
}
