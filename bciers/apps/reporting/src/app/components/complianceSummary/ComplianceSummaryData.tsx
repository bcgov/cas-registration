import React from "react";
// import { actionHandler } from "@bciers/actions";
import ComplianceSummary from "./ComplianceSummary";
import { tasklistData } from "./TaskListElements";

interface Props {
  versionId: number;
}

const ComplianceSummaryData = async ({ versionId }: Props) => {
  const formData = {
    attributableForReporting: "1000",
    reportingOnlyEmission: "1000",
    emissionsLimit: "1000",
    excessEmissions: "1000",
    creditedEmissions: "1000",
    regulatoryValues: {
      reductionFactor: "1000",
      tighteningRate: "1000",
      initialCompliancePeriod: "1000",
      compliancePeriod: "1000",
    },
    products: [
      {
        name: "Hockey sticks",
        customUnit: "Shots",
        annualProduction: "1000",
        emissionIntensity: "1000",
        allocatedIndustrialProcessEmissions: "1000",
        allocatedComplianceEmissions: "1000",
      },
      {
        name: "Pucks",
        customUnit: "Goals",
        annualProduction: "1000",
        emissionIntensity: "1000",
        allocatedIndustrialProcessEmissions: "1000",
        allocatedComplianceEmissions: "1000",
      },
    ],
  };

  return (
    <ComplianceSummary
      versionId={versionId}
      summaryFormData={formData}
      taskListElements={tasklistData}
    />
  );
};

export default ComplianceSummaryData;
