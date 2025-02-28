import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import Check from "@bciers/components/icons/Check";
import Link from "next/link";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import {ghgRegulatorEmail, reportAnEventLink} from "@bciers/utils/src/urls";

interface SubmissionProps {
  step: number;
  steps: string[];
}

const Submission = ({
  step,
  steps = allOperationRegistrationSteps,
}: SubmissionProps) => {
  return (
    <>
      <MultiStepHeader stepIndex={step - 1} steps={steps} />
      <h2 className="form-heading mt-0">Submission</h2>
      <section className="flex flex-col items-center justify-center max-w-[600px] mx-auto mt-10">
        <div className="flex flex-col items-center justify-center">
          {Check}
          <h3 className="mb-2 mt-4">Registration complete</h3>
          <p className="m-0">This operation has been registered.</p>
        </div>
        <section>
          <p className="mt-6 mb-0" data-testid="submission-message">
            The Greenhouse Gas Emission Reporting Regulation requires an
            operator to report the following events:
          </p>
          <ul className="pl-6 my-0">
            <li>A closure or temporary shutdown;</li>
            <li>An acquisition or divestment;</li>
            <li>A change in the operator having control or direction; or</li>
            <li>A transfer of control and direction to the operator</li>
          </ul>
          <p className="mb-0">
            To report any of these events, please use the following link:{" "}
            <Link href={reportAnEventLink} target="_blank">Link to form</Link>
          </p>
          <p className="mt-0">
            Staff will review the information provided and administer changes in
            BCIERS as needed. For questions reach out to{" "}
            <Link href={ghgRegulatorEmail}>GHGRegulator@gov.bc.ca</Link>.
          </p>
          <p>
            If you did not have any of these events, no further action is
            required and this registration is complete, and you may return back
            to the dashboard.
          </p>
        </section>
        <Link className="link-button-outlined" href="/">
          Back to Dashboard
        </Link>
      </section>
    </>
  );
};

export default Submission;
