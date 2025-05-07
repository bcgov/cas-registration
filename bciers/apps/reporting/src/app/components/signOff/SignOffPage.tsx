import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import SignOffForm from "./SignOffForm";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { getFlow } from "@reporting/src/app/components/taskList/reportingFlows";
import { buildSignOffSchema } from "@reporting/src/data/jsonSchema/signOff/signOff";

export default async function SignOffPage({ version_id }: HasReportVersion) {
  //🔍 Check if reports need verification
  const { show_verification_page: showVerificationPage } =
    await getReportNeedsVerification(version_id);
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);
  const isRegulatedOperation =
    (await getRegistrationPurpose(version_id))?.registration_purpose ===
    "OBPS Regulated Operation";

  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.SignOff,
    version_id,
    "",
    { skipVerification: !showVerificationPage },
  );
  const flow = await getFlow(version_id);

  const schema = buildSignOffSchema(
    isSupplementaryReport.is_supplementary_report_version,
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
