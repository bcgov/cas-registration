import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { getOperationFacilitiesList } from "@reporting/src/app/utils/getOperationFacilitiesList";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";
import { FinalReviewForm } from "@reporting/src/app/components/finalReview/FinalReviewForm";

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

  // If number of facilities is >40, we don't fetch the report data
  if (selectedFacilitiesCount > 40) {
    return <FinalReviewForm navigationInformation={navInfo} data={null} />;
  }

  const finalReviewData = await getFinalReviewData(version_id);

  return (
    <FinalReviewForm navigationInformation={navInfo} data={finalReviewData} />
  );
}
