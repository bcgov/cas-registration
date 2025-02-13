import React from "react";
import OperationEmissionSummaryForm from "./OperationEmissionSummaryForm";
import {
  ActivePage,
  getAdditionalInformationTaskList,
} from "@reporting/src/app/components/taskList/3_additionalInformation";
import { NEW_ENTRANT_REGISTRATION_PURPOSE } from "@reporting/src/app/utils/constants";
import { getOperationEmissionSummaryData } from "@bciers/actions/api/getOperationEmissionSummaryData";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";

interface Props {
  version_id: number;
}

const OperationEmissionSummaryPage = async ({ version_id }: Props) => {
  const summaryData = await getOperationEmissionSummaryData(version_id);
  const isNewEntrant =
    (await getRegistrationPurpose(version_id))?.registration_purpose ===
    NEW_ENTRANT_REGISTRATION_PURPOSE;
  const operationType = await getFacilityReport(version_id);

  const taskListData = getAdditionalInformationTaskList(
    version_id,
    ActivePage.OperationEmissionSummary,
    isNewEntrant,
    operationType?.operation_type,
  );
  return (
    <OperationEmissionSummaryForm
      versionId={version_id}
      summaryFormData={summaryData}
      taskListElements={taskListData}
      isNewEntrant={isNewEntrant}
    />
  );
};

export default OperationEmissionSummaryPage;
