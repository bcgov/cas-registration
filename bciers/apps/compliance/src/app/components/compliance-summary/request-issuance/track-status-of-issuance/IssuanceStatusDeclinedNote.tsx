import AlertNote from "@bciers/components/form/components/AlertNote";
import { Link } from "@mui/material";
import React from "react";
import {
  bcCarbonRegistryLink,
  bceabLink,
  ghgRegulatorEmail,
} from "@bciers/utils/src/urls";
import { AnalystSuggestion } from "@bciers/utils/src/enums";

type Props = {
  formContext?: {
    analystSuggestion?: AnalystSuggestion;
    latestComplianceReportVersionId?: number;
    supplementaryDeclined?: boolean;
  };
};

export const IssuanceStatusDeclinedNote = (props: Props) => {
  const analystSuggestion = props.formContext?.analystSuggestion;
  const latestComplianceReportVersionId =
    props.formContext?.latestComplianceReportVersionId;
  const supplementaryDeclined = props.formContext?.supplementaryDeclined;
  const path = `/compliance/compliance-administration/compliance-summaries/${latestComplianceReportVersionId}/review-compliance-earned-credits-report`;

  return supplementaryDeclined ? (
    <AlertNote>
      This issuance request is declined because you submitted a supplementary
      report. Please{" "}
      <Link href={path} className="text-bc-link-blue decoration-bc-link-blue">
        submit a new issuance of earned credits request.
      </Link>
    </AlertNote>
  ) : (
    <AlertNote>
      <>
        Your request is declined. The earned credits will not be issued to your
        holding account as identified below in the{" "}
        {analystSuggestion ===
        AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT ? (
          <>
            B.C. Carbon Registry (BCCR). Please contact us at{" "}
            <Link href={ghgRegulatorEmail}>GHGRegulator@gov.bc.ca</Link> for
            further information or assistance in submitting a supplementary
            report.
          </>
        ) : (
          <>
            <Link
              href={bcCarbonRegistryLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              B.C. Carbon Registry
            </Link>{" "}
            (BCCR). You may appeal the decision via the{" "}
            <Link href={bceabLink} target="_blank" rel="noopener noreferrer">
              B.C. Environmental Appeal Board
            </Link>{" "}
            (BCEAB).
          </>
        )}
      </>
    </AlertNote>
  );
};
