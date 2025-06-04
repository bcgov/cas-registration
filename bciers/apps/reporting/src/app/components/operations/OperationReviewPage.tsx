import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import OperationReviewForm from "./OperationReviewForm";
import { buildOperationReviewSchema } from "@reporting/src/data/jsonSchema/operations";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import { getReviewOperationInformationPageData } from "@reporting/src/app/utils/getReportOperationData";

export default async function OperationReviewPage({
  version_id,
}: HasReportVersion) {
  const data = await getReviewOperationInformationPageData(version_id);

  const navigationInformation = await getNavigationInformation(
    HeaderStep.OperationInformation,
    ReportingPage.ReviewOperationInfo,
    version_id,
    data.facility_id,
  );

  const schema = buildOperationReviewSchema(
    data.report_operation,
    data.reporting_year,
    data.all_activities,
    data.all_regulated_products,
    data.all_representatives,
    data.report_type,
    data.show_regulated_products,
    data.show_boro_id,
    data.show_activities,
  );

  return (
    <OperationReviewForm
      formData={data.report_operation}
      version_id={version_id}
      schema={schema}
      navigationInformation={navigationInformation}
      reportType={data.report_type}
      reportingYear={data.reporting_year}
      allActivities={data.all_activities}
      allRegulatedProducts={data.all_regulated_products}
      facilityId={data.facility_id}
    />
  );
}
