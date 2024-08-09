import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import Check from "@bciers/components/icons/Check";
import { Alert } from "@mui/material";
import Link from "next/link";
import { allOperationRegistrationSteps } from "./enums";

interface SubmissionProps {
  step: number;
  steps: string[];
}

const Submission = ({
  step,
  steps = allOperationRegistrationSteps,
}: SubmissionProps) => {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  return (
    <>
      <MultiStepHeader stepIndex={step - 1} steps={steps} />
      <h2 className="form-heading">Submission</h2>
      <section className="flex flex-col items-center justify-center max-w-[600px] m-auto">
        <div className="flex flex-col items-center justify-center">
          {Check}
          <h3 className="mb-2 mt-4">Registration complete</h3>
          <p className="m-0">This operation has been registered</p>
        </div>
        <div className="mt-6">
          <p className="m-0">
            Did your operation or facility have any of the following changes in{" "}
            {previousYear} or {currentYear}?
          </p>
        </div>
        <ul>
          <li>a closing or temporary shutdown</li>
          <li>an acquisition or a divestment</li>
          <li>
            a change in the operator having control and direction or a transfer
            of control and direction to the operator
          </li>
        </ul>
        <Alert
          severity="warning"
          sx={{
            padding: "20px 24px",
            color: "text.primary",
            fontSize: "16px",
          }}
        >
          If yes, and you have not reported it yet, please report it in the
          Report a Change page. Otherwise, no further action is required and
          this registration is complete.
        </Alert>
        <div className="flex flex-col items-center justify-center">
          <Link className="link-button-blue my-4" href="/tbd">
            Report a change
          </Link>
          <Link className="link-button-outlined" href="/tbd">
            Return to Dashboard
          </Link>
        </div>
      </section>
    </>
  );
};

export default Submission;
