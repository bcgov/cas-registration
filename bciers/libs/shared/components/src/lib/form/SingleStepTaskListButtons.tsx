import { Button } from "@mui/material";

interface SingleStepTaskListButtonsProps {
  disabled?: boolean;
  isSubmitting: boolean;
}

const SingleStepTaskListButtons = ({
  disabled,
  isSubmitting,
}: SingleStepTaskListButtonsProps) => {
  const isDisabled = disabled || isSubmitting;
  return (
    <div className="w-full flex justify-end mt-8">
      <Button variant="contained" disabled={isDisabled}>
        Submit
      </Button>
      <Button className="ml-4" variant="outlined" type="button">
        Cancel
      </Button>
    </div>
  );
};

export default SingleStepTaskListButtons;
