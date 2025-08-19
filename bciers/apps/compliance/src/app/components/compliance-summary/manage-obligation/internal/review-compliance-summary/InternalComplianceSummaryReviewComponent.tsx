"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  internalComplianceSummaryReviewUiSchema,
  createInternalComplianceSummaryReviewSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/internal/InternalComplianceSummaryReviewSchema";
import { FormBase } from "@bciers/components/form";
import { ComplianceSummary } from "@/compliance/src/app/types";
import { useBreadcrumb } from "@bciers/components";
import { useEffect } from "react";

interface Props {
  data: ComplianceSummary;
}

export function InternalComplianceSummaryReviewComponent({
  data,
}: Readonly<Props>) {
  const backUrl = "/compliance-summaries";

  const { setLastTitle } = useBreadcrumb();

  // Set breadcrumb title for this page
  useEffect(() => {
    if (data?.reporting_year) {
      setLastTitle(
        `Review ${data.reporting_year} Compliance Obligation Report`,
      );
    }
    return () => setLastTitle(null);
  }, [data?.reporting_year, setLastTitle]);

  return (
    <FormBase
      schema={createInternalComplianceSummaryReviewSchema(data.reporting_year)}
      uiSchema={internalComplianceSummaryReviewUiSchema}
      formData={data}
      className="w-full"
    >
      <ComplianceStepButtons backUrl={backUrl} />
    </FormBase>
  );
}
