import React from "react";
import OperationEmissionSummaryForm from "./OperationEmissionSummaryForm";
import { getAdditionalInformationTaskList } from "@reporting/src/app/components/taskList/3_additionalInformation";
import { NEW_ENTRANT_REGISTRATION_PURPOSE } from "@reporting/src/app/utils/constants";
import getOperationEmissionSummaryData from "@bciers/actions/api/getOperationEmissionSummaryData";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";

interface Props {
  version_id: number;
}

const OperationEmissionSummaryPage = async ({ version_id }: Props) => {
  const summaryData = await getOperationEmissionSummaryData(version_id);
  const taskListData = getAdditionalInformationTaskList(version_id);

  const emissionSummaryTaskListElement = taskListData.find(
    (e) => e.title == "Operation emission summary",
  );
  if (emissionSummaryTaskListElement)
    emissionSummaryTaskListElement.isActive = true;

  const isNewEntrant =
    (await getRegistrationPurpose(version_id)) ===
    NEW_ENTRANT_REGISTRATION_PURPOSE;

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
