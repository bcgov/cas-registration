import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import SignOffForm from "./SignOffForm";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";

export default async function SignOffPage({ version_id }: HasReportVersion) {
  //🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id);
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);
  const isRegulatedOperation =
    (await getRegistrationPurpose(version_id))?.registration_purpose ===
    "OBPS Regulated Operation";

  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.SignOff,
    version_id,
    "",
    { skipVerification: !needsVerification },
  );

  return (
    <SignOffForm
      version_id={version_id}
      navigationInformation={navInfo}
      isSupplementaryReport={
        isSupplementaryReport.is_supplementary_report_version
      }
      isRegulatedOperation={isRegulatedOperation}
    />
  );
}
