import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import {
  ActivePage,
  getSignOffAndSubmitSteps,
} from "@reporting/src/app/components/taskList/5_signOffSubmit";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import FinalReviewForm from "@reporting/src/app/components/finalReview/FinalReviewForm";
import { getReportingOperation } from "../../utils/getReportingOperation";
import {
  operationReviewSchema,
  operationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import {
  personResponsibleSchema,
  personResponsibleUiSchema,
} from "@reporting/src/data/jsonSchema/personResponsible";
import { getReportingPersonResponsible } from "../../utils/getReportingPersonResponsible";

export default async function FinalReviewPage({
  version_id,
}: HasReportVersion) {
  //🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id);
  const taskListElements = await getSignOffAndSubmitSteps(
    version_id,
    ActivePage.FinalReview,
    needsVerification,
  );

  const { sync_button: any, ...personResponsibleUiSchemaWithoutSyncButton } =
    personResponsibleUiSchema;

  const finalReviewData: { schema: any; data: any; uiSchema: any }[] = [
    {
      schema: operationReviewSchema,
      data: await getReportingOperation(version_id),
      uiSchema: operationReviewUiSchema,
    },
    {
      schema: personResponsibleSchema,
      uiSchema: personResponsibleUiSchemaWithoutSyncButton,
      data: await getReportingPersonResponsible(version_id),
    },
  ];

  console.log(finalReviewData[0].data);

  return (
    <FinalReviewForm
      version_id={version_id}
      taskListElements={taskListElements}
      data={finalReviewData}
    />
  );
}
