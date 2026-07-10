import Tooltip from "@mui/material/Tooltip";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  interestRegulationLink,
  penaltiesRegulationLink,
} from "@bciers/utils/src/urls";

type Props = {
  registry: {
    formContext: {
      isPenalty?: boolean;
    };
  };
};

export const PaymentInstructionsDetails = ({
  registry: {
    formContext: { isPenalty },
  },
}: Props) => {
  return (
    <div className="w-full mb-8">
      <h3>Before making a payment</h3>
      <p>
        Send an email notification to{" "}
        <a href="mailto:OBPSPayments@gov.bc.ca">OBPSPayments@gov.bc.ca</a>{" "}
        before sending payment
      </p>
      <p>Include:</p>
      <ul>
        <li>Operator Name</li>
        <li>Exact payment date</li>
        <li>Payment amount</li>
        <li>Invoice number</li>
        <li>Person(s) to contact regarding payments</li>
      </ul>
      <h3>Pay by electronic funds transfer (EFT) or by wire transfer</h3>
      <ul>
        <li>Include the invoice number as a reference</li>
        {!isPenalty && (
          <li>
            Plan to make your payment at least five business days before the
            compliance obligation deadline to allow for payment processing. The
            payment date determines compliance with the deadline. Important
            note: Payment date is the date when payment is deposited into the
            B.C. OBPS bank account.
          </li>
        )}
      </ul>
      <h3>Provide correct information for timely processing</h3>
      <p>
        Failure to provide accurate payment information will result in delays in
        payment processing and possible interest and/or penalty charges.
      </p>
      <h3>Requesting additional payment information</h3>
      <p>
        To request voice authorization, additional payment information, to
        obtain a bank letter, or for any questions, please contact{" "}
        <a href="mailto:OBPSPayments@gov.bc.ca">OBPSPayments@gov.bc.ca</a>.
      </p>
    </div>
  );
};

export const PaymentRemarks = () => {
  return (
    <div className="w-full">
      <ul>
        <li>
          Pay 5 business days in advance of the due date to allow for processing
          to avoid{" "}
          <Tooltip title="Link opens in a new tab" placement="top" arrow>
            <a
              href={penaltiesRegulationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              penalties
              <OpenInNewIcon
                fontSize="inherit"
                style={{ marginLeft: ".1rem" }}
              />
            </a>
          </Tooltip>{" "}
          and/or{" "}
          <Tooltip title="Link opens in a new tab" placement="top" arrow>
            <a
              href={interestRegulationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              interests
              <OpenInNewIcon
                fontSize="inherit"
                style={{ marginLeft: ".1rem" }}
              />
            </a>
          </Tooltip>
        </li>
        <li>Do not include other charges with your payment for this invoice</li>
        <li>Do not mail cash</li>
      </ul>
    </div>
  );
};
