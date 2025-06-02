import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import OperationReviewForm from "./OperationReviewForm";
import { buildOperationReviewSchema } from "@reporting/src/data/jsonSchema/operations";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import { getReportingOperationData } from "@reporting/src/app/utils/getReportOperationData";

export default async function OperationReviewPage({
  version_id,
}: HasReportVersion) {
  const data = await getReportingOperationData(version_id);

  const navigationInformation = await getNavigationInformation(
    HeaderStep.OperationInformation,
    ReportingPage.ReviewOperationInfo,
    version_id,
    data.facilityId,
  );

  const schema = buildOperationReviewSchema(
    data.reportOperation,
    data.reportingYear,
    data.allActivities,
    data.allRegulatedProducts,
    data.allRepresentatives,
    data.reportType,
    data.showRegulatedProducts,
    data.showBoroId,
    data.showActivities,
  );

  return (
    <OperationReviewForm
      formData={data.reportOperation}
      version_id={version_id}
      schema={schema}
      navigationInformation={navigationInformation}
      reportType={data.reportType}
      reportingYear={data.reportingYear}
      allActivities={data.allActivities}
      allRegulatedProducts={data.allRegulatedProducts}
      facilityId={data.facilityId}
    />
  );
}
