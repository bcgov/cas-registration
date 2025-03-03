import {
  buildOperationReviewSchema,
  operationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { ReviewDataFactoryItem } from "./factory";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import { getReportType } from "@reporting/src/app/utils/getReportType";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getRegulatedProducts } from "@bciers/actions/api";
import {
  ELECTRICITY_IMPORT_OPERATION,
  POTENTIAL_REPORTING_OPERATION,
  REPORTING_OPERATION,
} from "@reporting/src/app/utils/constants";

const operationReviewFactoryItem: ReviewDataFactoryItem = async (versionId) => {
  const reportingOperationData = await getReportingOperation(versionId);

  const reportingYear = await getReportingYear();
  const reportingWindowEnd = formatDate(
    reportingYear.reporting_window_end,
    "MMM DD YYYY",
  );

  const registrationPurpose = (await getRegistrationPurpose(versionId))
    .registration_purpose;

  const allActivities = await getAllActivities();
  const allRegulatedProducts = await getRegulatedProducts();
  const reportType = await getReportType(versionId);
  const showRegulatedProducts = ![
    ELECTRICITY_IMPORT_OPERATION,
    REPORTING_OPERATION,
    POTENTIAL_REPORTING_OPERATION,
  ].includes(registrationPurpose);

  const schema: any = buildOperationReviewSchema(
    formData,
    registrationPurpose,
    reportingWindowEnd,
    allActivities,
    allRegulatedProducts,
    reportingOperationData.report_operation_representatives,
    reportType,
    showRegulatedProducts,
  );

  // Purpose note doesn't show up on the final review page
  delete schema.properties.purpose_note;

  return [
    {
      schema: schema,
      data: formData,
      uiSchema: operationReviewUiSchema,
    },
  ];
};

export default operationReviewFactoryItem;
