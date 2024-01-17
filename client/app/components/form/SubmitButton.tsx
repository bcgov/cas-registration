"use client";

import { Button } from "@mui/material";

interface SubmitButtonProps {
  label: string;
  disabled?: boolean;
}

const SubmitButton: React.FunctionComponent<SubmitButtonProps> = ({
  label,
  disabled,
}) => {
  return (
    <Button
      variant="contained"
      type="submit"
      aria-disabled={disabled}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};
export default SubmitButton;
