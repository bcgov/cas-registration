import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import OperationReviewForm from "./OperationReviewForm";
import { buildOperationReviewSchema } from "@reporting/src/data/jsonSchema/operations";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { getOperationSchemaParameters } from "@reporting/src/app/components/operations/getOperationSchemaParameters";

export default async function OperationReviewPage({
  version_id,
}: HasReportVersion) {
  const reportOperation = await getReportingOperation(version_id);
  const facilityReport = await getFacilityReport(version_id);

  const navigationInformation = await getNavigationInformation(
    HeaderStep.OperationInformation,
    ReportingPage.ReviewOperationInfo,
    version_id,
    facilityReport.facility_id,
  );

  const params = await getOperationSchemaParameters(version_id);
  const schema = buildOperationReviewSchema(
    params.reportOperation,
    params.reportingWindowEnd,
    params.allActivities,
    params.allRegulatedProducts,
    params.allRepresentatives,
    params.reportType,
    params.showRegulatedProducts,
    params.showBoroId,
    params.showActivities,
  );

  return (
    <OperationReviewForm
      formData={reportOperation}
      version_id={version_id}
      schema={schema}
      navigationInformation={navigationInformation}
      reportType={params.reportType}
      reportingWindowEnd={params.reportingWindowEnd}
      allActivities={params.allActivities}
      allRegulatedProducts={params.allRegulatedProducts}
      facilityId={facilityReport.facility_id}
    />
  );
}
