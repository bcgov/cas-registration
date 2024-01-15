"use client";

import { Button } from "@mui/material";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
  disabled?: boolean;
}

const SubmitButton: React.FunctionComponent<SubmitButtonProps> = ({
  label,
  disabled,
}) => {
  const { pending } = useFormStatus();
  return (
    <Button
      variant="contained"
      type="submit"
      aria-disabled={disabled || pending}
      disabled={disabled || pending}
    >
      {label}
    </Button>
  );
};
export default SubmitButton;
