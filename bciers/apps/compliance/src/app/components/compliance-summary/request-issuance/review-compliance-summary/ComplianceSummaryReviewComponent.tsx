"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  complianceSummaryReviewUiSchema,
  createComplianceSummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/complianceSummaryReviewSchema";
import { RequestIssuanceComplianceSummaryData } from "@/compliance/src/app/types";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { useBreadcrumb } from "@bciers/components";
import { useEffect } from "react";

interface Props {
  data: RequestIssuanceComplianceSummaryData;
  complianceReportVersionId: number;
}

const ComplianceSummaryReviewComponent = ({
  data,
  complianceReportVersionId,
}: Readonly<Props>) => {
  const isCasStaff = useSessionRole().includes("cas_");
  const backUrl = "/compliance-summaries";

  let saveAndContinueUrl = `/compliance-summaries/${complianceReportVersionId}/request-issuance-of-earned-credits`;

  const { setLastTitle } = useBreadcrumb();

  // Set breadcrumb title for this page
  useEffect(() => {
    if (data?.reporting_year) {
      setLastTitle(`Review ${data.reporting_year} Compliance Report`);
    }
    return () => setLastTitle(null);
  }, [data?.reporting_year, setLastTitle]);

  if (isCasStaff) {
    saveAndContinueUrl = `/compliance-summaries/${complianceReportVersionId}/review-credits-issuance-request`;
    // Don't show the continue button to internal users if the issuance status is CREDITS_NOT_ISSUED
    if (data.issuance_status === IssuanceStatus.CREDITS_NOT_ISSUED) {
      saveAndContinueUrl = "";
    }
  }

  return (
    <FormBase
      schema={createComplianceSummaryReviewSchema(data.reporting_year)}
      uiSchema={complianceSummaryReviewUiSchema(isCasStaff)}
      formData={data}
      className="w-full min-h-[62vh] flex flex-col justify-between"
    >
      <ComplianceStepButtons
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        className="mt-44"
      />
    </FormBase>
  );
};

export default ComplianceSummaryReviewComponent;
