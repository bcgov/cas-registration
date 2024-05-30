import { Button } from "@mui/material";

interface SingleStepTaskListButtonsProps {
  disabled?: boolean;
  onSubmit: () => void;
}

const SingleStepTaskListButtons = ({
  disabled,
  onSubmit,
}: SingleStepTaskListButtonsProps) => {
  return (
    <div className="w-full flex justify-end mt-8">
      <Button variant="contained" disabled={disabled} onClick={onSubmit}>
        Submit
      </Button>
      <Button className="ml-4" variant="outlined" type="button">
        Cancel
      </Button>
    </div>
  );
};

export default SingleStepTaskListButtons;
