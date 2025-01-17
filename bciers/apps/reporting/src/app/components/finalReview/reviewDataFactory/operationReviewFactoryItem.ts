import {
  operationReviewSchema,
  operationReviewUiSchema,
  updateSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { ReviewDataFactoryItem } from "./factory";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getRegulatedProducts } from "@bciers/actions/api";

const operationReviewFactoryItem: ReviewDataFactoryItem = async (versionId) => {
  const formData = await getReportingOperation(versionId);

  const reportingYear = await getReportingYear();
  const reportingWindowEnd = formatDate(
    reportingYear.reporting_window_end,
    "MMM DD YYYY",
  );

  const registrationPurpose = (await getRegistrationPurpose(versionId))
    .registration_purpose;

  const allActivities = await getAllActivities();
  const allRegulatedProducts = await getRegulatedProducts();

  const schema: any = updateSchema(
    operationReviewSchema,
    formData,
    registrationPurpose,
    reportingWindowEnd,
    allActivities,
    allRegulatedProducts,
  );

  return [
    {
      schema: schema,
      data: formData,
      uiSchema: operationReviewUiSchema,
    },
  ];
};

export default operationReviewFactoryItem;
