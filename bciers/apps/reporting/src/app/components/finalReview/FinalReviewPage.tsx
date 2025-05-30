import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import FinalReviewForm from "@reporting/src/app/components/finalReview/FinalReviewForm";
import reviewDataFactory, {
  ReviewData,
} from "@reporting/src/app/components/finalReview/reviewDataFactory/factory";
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
  const facilities = await getOperationFacilitiesList(version_id);
  // count the number of current_facilities that are selected
  const selectedFacilitiesCount = facilities.current_facilities.filter(
    (facility) => facility.is_selected,
  ).length;

  let finalReviewData: ReviewData[] = [];

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
  // if number of facilities is >20
  if (selectedFacilitiesCount > 20) {
    console.warn(
      "You have " +
        selectedFacilitiesCount +
        " facilities selected. That's too many facilities.",
    );
    // instead of using reviewDataFactory, we will fill finalReviewData with a component that
    // displays a button that opens a new tab where the data will be displayed ugly-style
  } else {
    // carrry on with rest of page
    // Get the report version flow data definitions
    const flowData = await getFlowData(version_id);

    const startTime = performance.now();

    // // Build final review data based on the report version flow type
    finalReviewData = await reviewDataFactory(version_id, flowData);

    const endTime = performance.now();
    console.log(
      `Final review data factory took ${endTime - startTime} milliseconds`,
    );
  }

  return (
    <FinalReviewForm navigationInformation={navInfo} data={finalReviewData} />
  );
}
