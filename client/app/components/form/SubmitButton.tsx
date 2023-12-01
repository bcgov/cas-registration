"use client";
import { Button } from "@mui/material";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
  classNames?: string;
  disabled?: boolean; // Add disabled prop
}

const SubmitButton: React.FunctionComponent<SubmitButtonProps> = ({
  label,
  classNames,
  disabled, // Receive disabled prop
}) => {
  const { pending } = useFormStatus();

  return (
    <div className={classNames}>
      <Button
        variant="contained"
        type="submit"
        aria-disabled={pending}
        disabled={disabled || pending} // Set the disabled prop
        sx={{ marginBottom: 10 }}
      >
        {label}
      </Button>
    </div>
  );
};

export default SubmitButton;
