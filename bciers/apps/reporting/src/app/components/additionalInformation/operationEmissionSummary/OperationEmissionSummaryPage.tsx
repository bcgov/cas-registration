import React from "react";
import OperationEmissionSummaryForm from "./OperationEmissionSummaryForm";
import { getOperationEmissionSummaryData } from "@bciers/actions/api/getOperationEmissionSummaryData";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { getNavigationInformation } from "../../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../../taskList/types";

interface Props {
  version_id: number;
}

const OperationEmissionSummaryPage = async ({ version_id }: Props) => {
  const summaryData = await getOperationEmissionSummaryData(version_id);
  const facilityReport = await getFacilityReport(version_id);

  const navInfo = await getNavigationInformation(
    HeaderStep.AdditionalInformation,
    ReportingPage.OperationEmissionSummary,
    version_id,
    facilityReport?.facility_id,
  );

  return (
    <OperationEmissionSummaryForm
      summaryFormData={summaryData}
      navigationInformation={navInfo}
    />
  );
};

export default OperationEmissionSummaryPage;
