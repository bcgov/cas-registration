import React from "react";
import { WidgetProps } from "@rjsf/utils";
import AlertNote from "@bciers/components/form/components/AlertNote";
import { TimeIcon } from "@bciers/components/icons";
import { Link } from "@mui/material";
import { BC_GOV_YELLOW } from "@bciers/styles";
import Check from "@bciers/components/icons/Check";
import {
  bcCarbonRegistryLink,
  ghgRegulatorEmail,
} from "@bciers/utils/src/urls";
import { IssuanceStatus } from "@bciers/utils/src/enums";
import AlertIcon from "@bciers/components/icons/AlertIcon";

const BCCRAccountMessage = () => (
  <Link
    href={bcCarbonRegistryLink}
    target="_blank"
    rel="noopener noreferrer"
    className="text-bc-link-blue decoration-bc-link-blue"
  >
    B.C. Carbon Registry
  </Link>
);

export const CreditIssuanceStatusWidget = (props: WidgetProps) => {
  const status = props.value as IssuanceStatus;
  const statusConfig = {
    [IssuanceStatus.AWAITING]: {
      icon: <TimeIcon fill={BC_GOV_YELLOW} width="20" height="20" />,
      message: (
        <>
          Your request has been submitted successfully. Once your request is
          approved, the earned credits will be issued to your holding account as
          identified below in the {BCCRAccountMessage()} (BCCR).
        </>
      ),
    },
    [IssuanceStatus.APPROVED]: {
      icon: <Check width="20" height="20" />,
      message: (
        <>
          Your request is approved. The earned credits have been issued to your
          holding account as identified below in the {BCCRAccountMessage()}{" "}
          (BCCR) successfully.
        </>
      ),
    },
    [IssuanceStatus.DECLINED]: {
      icon: <AlertIcon width="20" height="20" />,
      message: (
        <>
          Your request is declined. The earned credits will not be issued to
          your holding account as identified below in the {BCCRAccountMessage()}{" "}
          (BCCR). You may appeal the decision via the{" "}
          <Link
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bc-link-blue decoration-bc-link-blue"
          >
            B.C. Environmental Appeal Board
          </Link>{" "}
          (BCEAB).
        </>
      ),
    },
    [IssuanceStatus.CHANGES_REQUIRED]: {
      icon: <AlertIcon width="20" height="20" />,
      message: (
        <>
          Your request has not been approved yet. Please{" "}
          <Link href="#" className="text-bc-link-blue decoration-bc-link-blue">
            submit a supplementary report
          </Link>{" "}
          in Reporting to make the changes required below, or contact us at{" "}
          <Link
            href={ghgRegulatorEmail}
            className="text-bc-link-blue decoration-bc-link-blue"
          >
            GHGRegulator@gov.bc.ca
          </Link>{" "}
          if you have questions.
        </>
      ),
    },
  };

  const config = statusConfig[status];
  if (!config) {
    throw new Error(`Missing status configuration for status: ${status}`);
  }

  return <AlertNote icon={config.icon}>{config.message}</AlertNote>;
};
