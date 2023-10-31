import React, { useState, ReactNode, ReactElement } from "react";
import { Form } from "formik";
import Stepper from "@mui/material/Stepper/Stepper";
import Step from "@mui/material/Step/Step";
import StepLabel from "@mui/material/StepLabel/StepLabel";
import Stack from "@mui/material/Stack/Stack";
import Button from "@mui/material/Button/Button";

const FormStepper: React.FC<{
  children: ReactNode;
  nextButtonProps?: {
    label: string;
    variant?: "outlined" | "contained";
    className?: string;
    disabled?: boolean;
  };
  backButtonProps?: {
    label: string;
    variant?: "outlined" | "contained";
    className?: string;
    disabled?: boolean;
  };
  submitButtonProps?: {
    label: string;
    variant?: "outlined" | "contained";
    className?: string;
    disabled?: boolean;
  };
}> = ({ children, nextButtonProps, backButtonProps, submitButtonProps }) => {
  const stepsArray = React.Children.toArray(children) as ReactElement[];
  const [step, setStep] = useState(0);
  const currentStep = stepsArray[step];

  const isBackDisabled = step === 0;
  const isNextDisabled = step === stepsArray.length - 1;
  return (
    <Form>
      <Stepper alternativeLabel activeStep={step} sx={{ marginBottom: 5 }}>
        {stepsArray.map((child, index) => (
          <Step key={index} completed={step > index}>
            <StepLabel>{(child as any).props.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {currentStep}
      <Stack direction="row" spacing={2} sx={{ marginTop: 5 }}>
        <Button
          variant={backButtonProps?.variant}
          className={backButtonProps?.className}
          onClick={() => {
            setStep(step - 1);
          }}
          disabled={isBackDisabled}
        >
          {backButtonProps?.label || "Back"}
        </Button>
        <Button
          variant={nextButtonProps?.variant}
          className={nextButtonProps?.className}
          onClick={() => {
            setStep(step + 1);
          }}
          disabled={isNextDisabled}
        >
          {nextButtonProps?.label || "Next"}
        </Button>
        {step === stepsArray.length - 1 && (
          <Button
            type="submit"
            variant={submitButtonProps?.variant}
            className={submitButtonProps?.className}
            disabled={submitButtonProps?.disabled}
          >
            {submitButtonProps?.label || "Submit"}
          </Button>
        )}
      </Stack>
    </Form>
  );
};

export default FormStepper;
