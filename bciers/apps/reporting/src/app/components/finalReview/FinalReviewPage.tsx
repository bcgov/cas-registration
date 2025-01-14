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
import { createPersonResponsibleSchema } from "../operations/personResponsible/createPersonResponsibleSchema";
import { getFacilityReport } from "../../utils/getFacilityReport";
import { getOrderedActivities } from "../../utils/getOrderedActivities";
import { getActivityFormData } from "../../utils/getActivityFormData";
import { getActivityInitData } from "../../utils/getActivityInitData";
import { getActivitySchema } from "../../utils/getActivitySchema";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";

// UiSchemas often contain client side components, passing a function will have it run on the client
type ReviewData = { schema: any; uiSchema: Object | string; data: any };

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

  // Operation Review

  // Person Responsible
  const { sync_button: any, ...personResponsibleUiSchemaWithoutSyncButton } =
    personResponsibleUiSchema;

  // Schemas
  const facilityId = (await getFacilityReport(version_id)).facility_id;
  const orderedActivities: any[] = await getOrderedActivities(
    version_id,
    facilityId,
  );

  const activityReviewData: ReviewData[] = [];
  for (const activity of orderedActivities) {
    const initData = safeJsonParse(
      await getActivityInitData(version_id, facilityId, activity.id),
    );

    const formData = await getActivityFormData(
      version_id,
      facilityId,
      activity.id,
    );

    const sourceTypeQueryString = Object.entries(initData.sourceTypeMap)
      .filter(([, v]) => String(v) in formData)
      .map(([k]) => `&source_types[]=${k}`)
      .join("");

    const schema = safeJsonParse(
      await getActivitySchema(version_id, activity.id, sourceTypeQueryString),
    ).schema;
    activityReviewData.push({
      schema: schema,
      uiSchema: activity.slug,
      data: formData,
    });

    console.log(schema);
    console.log(formData);
  }

  const finalReviewData: ReviewData[] = [
    {
      schema: operationReviewSchema,
      data: await getReportingOperation(version_id),
      uiSchema: operationReviewUiSchema,
    },
    {
      schema: createPersonResponsibleSchema(
        personResponsibleSchema,
        [],
        1,
        await getReportingPersonResponsible(version_id),
      ),
      uiSchema: personResponsibleUiSchemaWithoutSyncButton,
      data: await getReportingPersonResponsible(version_id),
    },
    ...activityReviewData,
  ];

  return (
    <FinalReviewForm
      version_id={version_id}
      taskListElements={taskListElements}
      data={finalReviewData}
    />
  );
}
