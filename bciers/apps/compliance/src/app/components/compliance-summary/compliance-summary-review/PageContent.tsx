import { FormReport } from "./FormReport";
import { ComplianceHeading } from "./ComplianceHeading";
import { ComplianceObligation } from "./ComplianceObligation";
import { ComplianceUnitsGrid } from "./ComplianceUnitsGrid";
import { MonetaryPaymentsGrid } from "./MonetaryPaymentsGrid";
import { OutstandingComplianceObligation } from "./OutstandingComplianceObligation";
import { AutomaticOverduePenalty } from "./AutomaticOverduePenalty";
import ComplianceStepButtons from "@bciers/components/form/components/ComplianceStepButtons";

interface PageContentProps {
  continueUrl: string;
  backUrl?: string;
  data: any;
}

export function PageContent(props: PageContentProps) {
  const { backUrl, continueUrl, data } = props;

  // Handler for Generate Compliance Invoice button
  const handleGenerateInvoice = () => {
    // Handle invoice generation
  };

  return (
    <div className="w-full">
      <ComplianceHeading />
      <FormReport data={data} />
      <ComplianceObligation data={data} />
      <ComplianceUnitsGrid data={""} />
      <MonetaryPaymentsGrid data={""} />
      <OutstandingComplianceObligation data={data} />
      <AutomaticOverduePenalty data={data} />

      <ComplianceStepButtons
        key="form-buttons"
        backUrl={backUrl}
        continueUrl={continueUrl}
        generateInvoice={handleGenerateInvoice}
        // isSaving={isSaving}
        // isSuccess={isSuccess}
        // isRedirecting={isRedirecting}
        // saveButtonDisabled={saveButtonDisabled}
        // submitButtonDisabled={submitButtonDisabled}
        // saveAndContinue={onSubmit ? onSaveAndContinue : undefined}
        // buttonText={buttonText}
        // noSaveButton={noSaveButton}
      />
    </div>
  );
}
