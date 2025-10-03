import AlertNote from "@bciers/components/form/components/AlertNote";
import {
  bcCarbonRegistryLink,
  ghgRegulatorEmail,
} from "@bciers/utils/src/urls";
import { Link } from "@mui/material";

export const ChangesRequiredAlertNote = (complianceReportVersionId: number) => {
  return (
    <AlertNote>
      Changes required. Please change your BCCR Holding Account ID on the
      <Link
        href={`/compliance-summaries/${complianceReportVersionId}/request-issuance-of-earned-credits`}
      >
        Request Issuance of Earned Credits page
      </Link>
      . If you have questions, contact{" "}
      <Link href={ghgRegulatorEmail}>GHGRegulator@gov.bc.ca</Link>.
    </AlertNote>
  );
};
