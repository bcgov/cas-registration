import { FormReport } from "./FormReport";
import { ComplianceHeading } from "../ComplianceHeading";
import { ComplianceObligation } from "./ComplianceObligation";
import { ComplianceUnitsGrid } from "./ComplianceUnitsGrid";
import { MonetaryPaymentsGrid } from "./MonetaryPaymentsGrid";
import { OutstandingComplianceObligation } from "./OutstandingComplianceObligation";
import { AutomaticOverduePenalty } from "./AutomaticOverduePenalty";
import ComplianceStepButtons from "@bciers/components/form/components/ComplianceStepButtons";

interface Props {
  continueUrl: string;
  backUrl?: string;
  data: any;
  complianceSummaryId?: number;
}

export function ComplianceSummaryReviewContent(props: Props) {
  const { backUrl, continueUrl, data, complianceSummaryId } = props;

  const handleGenerateInvoice = () => {};

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
        middleButtonDisabled={false}
        submitButtonDisabled={false}
        middleButtonText="Generate Compliance Invoice"
        onMiddleButtonClick={handleGenerateInvoice}
      />
    </div>
  );
}
