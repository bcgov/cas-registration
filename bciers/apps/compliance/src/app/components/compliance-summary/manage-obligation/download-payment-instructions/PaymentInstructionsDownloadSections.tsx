export const PaymentInstructionsDetails = () => {
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
      </ul>
      <h3>Pay by electronic fund transfer (EFT)</h3>
      <ul>
        <li>Include the invoice number as a reference</li>
        <li>
          Pay at least five business days before the due date to allow for
          processing time
        </li>
      </ul>
      <h3>Pay by wire transfer</h3>
      <p>Include the invoice number as a reference</p>
      <h3>Provide correct information for timely processing</h3>
      <p>
        Failure to provide accurate payment information will result in delays in
        payment processing and possible interest and/or penalty charges.
      </p>
      <p>
        Contact{" "}
        <a href="mailto:OBPSPayments@gov.bc.ca">OBPSPayments@gov.bc.ca</a> for
        any questions.
      </p>
    </div>
  );
};

export const PaymentRemarks = () => {
  return (
    <div className="w-full">
      <ul>
        <li>
          Pay by the due date to avoid <a>penalties</a> and/or <a>interests</a>
        </li>
        <li>Do not include other charges with your payment for this invoice</li>
        <li>Do not mail cash</li>
      </ul>
    </div>
  );
};
