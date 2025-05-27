import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import SignOffForm from "./SignOffForm";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { getFlow } from "@reporting/src/app/components/taskList/reportingFlows";
import { buildSignOffSchema } from "@reporting/src/data/jsonSchema/signOff/signOff";

export default async function SignOffPage({ version_id }: HasReportVersion) {
  const isRegulatedOperation =
    (await getRegistrationPurpose(version_id))?.registration_purpose ===
    "OBPS Regulated Operation";

  //🔍 Check if is a supplementary report
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);

  //🔍 Check if reports need verification
  const { show_verification_page: showVerificationPage } =
    await getReportVerificationStatus(version_id);
  console.log("checking to see if verification page should be shown", {
    showVerificationPage,
  });

  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.SignOff,
    version_id,
    "",
    {
      skipVerification: !showVerificationPage,
      skipChangeReview: !isSupplementaryReport,
    },
  );
  console.log("navigation info", navInfo);
  const flow = await getFlow(version_id);

  const schema = buildSignOffSchema(
    isSupplementaryReport,
    isRegulatedOperation,
    flow,
  );

  return (
    <SignOffForm
      version_id={version_id}
      navigationInformation={navInfo}
      schema={schema}
    />
  );
}
