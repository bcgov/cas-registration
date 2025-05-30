import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import FinalReviewForm from "@reporting/src/app/components/finalReview/FinalReviewForm";
import reviewDataFactory from "@reporting/src/app/components/finalReview/reviewDataFactory/factory";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { getOperationFacilitiesList } from "@reporting/src/app/utils/getOperationFacilitiesList";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import { getFlowData } from "@reporting/src/app/components/taskList/reportingFlows";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";

export default async function FinalReviewPage({
  version_id,
}: HasReportVersion) {
  const facilities: {
    current_facilities: { is_selected: boolean }[];
    past_facilities: { is_selected: boolean }[];
  } = await getOperationFacilitiesList(version_id);

  // count the number of current_facilities that are selected
  const selectedFacilitiesCount =
    facilities.current_facilities.filter((facility) => facility.is_selected)
      .length +
    facilities.past_facilities.filter((facility) => facility.is_selected)
      .length;

  //🔍 Check if is a supplementary report
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);
  //🔍 Check if reports need verification
  const { show_verification_page: showVerificationPage } =
    await getReportVerificationStatus(version_id);
  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.FinalReview,
    version_id,
    "",
    {
      skipVerification: !showVerificationPage,
      skipChangeReview: !isSupplementaryReport,
    },
  );

  // If number of facilities is >50, we don't fetch the report data
  if (selectedFacilitiesCount > 50) {
    return <FinalReviewForm navigationInformation={navInfo} data={[]} />;
  }

  const flowData = await getFlowData(version_id);
  const finalReviewData = await reviewDataFactory(version_id, flowData);

  return (
    <FinalReviewForm navigationInformation={navInfo} data={finalReviewData} />
  );
}
