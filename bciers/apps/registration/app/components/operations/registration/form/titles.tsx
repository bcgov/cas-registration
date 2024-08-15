import { ggerrLink } from "@bciers/utils/urls";

const GenerateNewEntrantFormMessage = (
  date: string,
  applicationUrl: string,
) => {
  return (
    <div className="max-w-[900px]">
      <p>
        For a definition of the Date of First Shipment, please refer to the{" "}
        <a href={ggerrLink} target="_blank" rel="noopener noreferrer">
          GGERR
        </a>
        .
      </p>
      <p>
        Please download and complete the following application form template to
        receive designation as a New Entrant in the B.C. OBPS. This application
        form is for operations with a date of First Shipment <b>{date}</b>.
      </p>
      <p>
        Download <a href={applicationUrl}>application form template</a>
      </p>
      <p>Please upload the completed form below.</p>
    </div>
  );
};

export { GenerateNewEntrantFormMessage };
